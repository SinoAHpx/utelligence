import { Message } from "ai/react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/store/chat-store";
import { visualizationChartStore } from "@/store";
import { useFileUploadStore } from "@/store/file-upload-store";
import { processBarChartData, processLineChartData, processAreaChartData, processPieChartData, processScatterChartData, processRadarChartData } from "../data/data-processing";

/**
 * Chat message type information
 */
export type ChatRole = "user" | "assistant" | "system";

/**
 * Chat options interface
 */
export interface ChatOptions {
	selectedModel: string;
	systemPrompt: string;
	temperature: number;
}

/**
 * Save chat messages to localStorage
 * @param chatId Chat ID
 * @param messages Messages to save
 */
export const saveChatMessages = (chatId: string, messages: Message[]): void => {
	if (!chatId) return;

	// Save to local storage with chat_ prefix
	const storageKey = `chat_${chatId}`;
	localStorage.setItem(storageKey, JSON.stringify(messages));

	// Trigger the storage event for other components to detect changes
	window.dispatchEvent(new Event("storage"));
};

/**
 * Load chat messages from localStorage
 * @param chatId Chat ID
 * @returns Messages array or empty array if not found
 */
export const loadChatMessages = (chatId: string): Message[] => {
	if (!chatId || typeof window === "undefined") return [];

	const storageKey = `chat_${chatId}`;
	try {
		const storedMessages = localStorage.getItem(storageKey);
		return storedMessages ? JSON.parse(storedMessages) : [];
	} catch (error) {
		console.error(`Error loading chat messages for ${chatId}:`, error);
		return [];
	}
};

/**
 * Get all chats from localStorage
 * @returns Object with chats grouped by date
 */
export const getLocalStorageChats = (): Record<
	string,
	{ chatId: string; messages: Message[] }[]
> => {
	if (typeof window === "undefined" || !localStorage) {
		return {};
	}

	// Get all keys that start with 'chat_'
	const chatKeys = Object.keys(localStorage).filter((key) =>
		key.startsWith("chat_"),
	);

	if (chatKeys.length === 0) {
		return {};
	}

	// Parse all chat messages and filter out any invalid ones
	const chatObjects = chatKeys
		.map((chatKey) => {
			const item = localStorage.getItem(chatKey);
			try {
				const messages = item ? JSON.parse(item) : [];
				if (Array.isArray(messages) && messages.length > 0) {
					return {
						chatId: chatKey.replace("chat_", ""),
						messages: messages as Message[],
					};
				}
			} catch (error) {
				console.error(`Error parsing localStorage item ${chatKey}:`, error);
			}
			return null;
		})
		.filter(
			(chat): chat is { chatId: string; messages: Message[] } => chat !== null,
		);

	// Sort chats by date (most recent first)
	chatObjects.sort((a, b) => {
		const aDate = new Date(a.messages[0]?.createdAt ?? 0);
		const bDate = new Date(b.messages[0]?.createdAt ?? 0);
		return bDate.getTime() - aDate.getTime();
	});

	// Group chats by date
	return groupChatsByDate(chatObjects);
};


// Define the Chats interface
export interface Chats {
	[key: string]: { chatId: string; messages: Message[] }[];
}

// Helper function to group chats by date
export const groupChatsByDate = (
	chatsToGroup: { chatId: string; messages: Message[] }[]
): Chats => {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const groupedChats: Chats = {};

	chatsToGroup.forEach((chat) => {
		// Add null/undefined check for createdAt
		const createdAt = chat.messages[0]?.createdAt
			? new Date(chat.messages[0].createdAt)
			: new Date(0);
		// Handle cases where createdAt might be invalid
		if (isNaN(createdAt.getTime())) {
			console.warn(`Invalid date for chat ${chat.chatId}, skipping grouping.`);
			return;
		}

		// Calculate difference in days relative to the start of the day
		const todayStart = new Date(today.setHours(0, 0, 0, 0));
		const createdAtStart = new Date(createdAt.setHours(0, 0, 0, 0));

		const diffInTime = todayStart.getTime() - createdAtStart.getTime();
		const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

		let group: string;
		if (diffInDays === 0) {
			group = "今天";
		} else if (diffInDays === 1) {
			group = "昨天";
		} else if (diffInDays <= 7) {
			group = "过去 7 天";
		} else if (diffInDays <= 30) {
			group = "过去 30 天";
		} else {
			group = "更早";
		}

		if (!groupedChats[group]) {
			groupedChats[group] = [];
		}
		groupedChats[group].push(chat);
	});

	return groupedChats;
};

export class UserMessage implements Message {
	id: string;
	role: 'user';
	content: string;
	constructor(content: string) {
		this.id = uuidv4();
		this.role = 'user';
		this.content = content;
	}
}

export class AssistantMessage implements Message {
	id: string;
	role: 'assistant';
	content: string;
	constructor(content: string = '') {
		this.id = uuidv4();
		this.role = 'assistant';
		this.content = content;
	}
}

/**
 * Clear all chat data from localStorage
 */
export const clearAllChatData = (): void => {
	if (typeof window === "undefined") return;

	// Clear all chat_ items from local storage
	Object.keys(localStorage)
		.filter(key => key.startsWith("chat_"))
		.forEach(key => localStorage.removeItem(key));

	// Trigger the storage event for other components to detect changes
	window.dispatchEvent(new Event("storage"));
};

/**
 * Abort controller for canceling ongoing requests
 */
let abortController: AbortController = new AbortController();

/**
 * Create a new message in the message list
 */
export const createMessage = async (userQuery: string) => {
	const { setIsLoading, setCurrentMessages, currentMessages } = useChatStore.getState()
	setIsLoading(true)

	// Create a new abort controller for this request
	abortController = new AbortController();

	const assistantMessage = new AssistantMessage()
	const userMessage = new UserMessage(userQuery)

	setCurrentMessages([...currentMessages, userMessage, assistantMessage])
	const { parsedData } = useFileUploadStore.getState()
	if (!parsedData) {
		await streamResponse(assistantMessage.id, '注意，用户目前没有上传文件，请你提醒用户上传文件。然后，再回答用户的问题。')
		setIsLoading(false)
		return
	}

	if (userQuery.includes('图')) {
		const { addChart } = visualizationChartStore.getState()

		//todo: enhance, you know what I mean
		// 关键词与列名的简单映射（可根据实际数据调整）
		const barKeywords = ["柱状图", "bar"];
		const lineKeywords = ["线形图", "折线图", "line"];
		const areaKeywords = ["面积图", "area"];
		const pieKeywords = ["饼图", "pie"];
		const scatterKeywords = ["散点图", "scatter"];
		const radarKeywords = ["雷达图", "radar"];

		// 假设数据有这些列名
		const xAxis = parsedData.headers.includes("年份") ? "年份" : parsedData.headers[0];
		const yAxis = parsedData.headers.includes("研究领域") ? "研究领域" : parsedData.headers[1] || parsedData.headers[0];

		// 柱状图
		if (barKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processBarChartData(parsedData, { xAxisColumn: xAxis, yAxisColumn: yAxis }),
				id: uuidv4(),
				chartType: "bar",
				title: `柱状图: ${xAxis} vs ${yAxis}`,
				xAxisColumn: xAxis,
				yAxisColumn: yAxis
			})
		}
		// 线形图
		if (lineKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processLineChartData(parsedData, { xAxisColumn: xAxis, yAxisColumn: yAxis }),
				id: uuidv4(),
				chartType: "line",
				title: `线形图: ${xAxis} vs ${yAxis}`,
				xAxisColumn: xAxis,
				yAxisColumn: yAxis
			})
		}
		// 面积图
		if (areaKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processAreaChartData(parsedData, { xAxisColumn: xAxis, yAxisColumn: yAxis }),
				id: uuidv4(),
				chartType: "area",
				title: `面积图: ${xAxis} vs ${yAxis}`,
				xAxisColumn: xAxis,
				yAxisColumn: yAxis
			})
		}
		// 饼图
		if (pieKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processPieChartData(parsedData, { valueColumn: yAxis }),
				id: uuidv4(),
				chartType: "pie",
				title: `饼图: ${yAxis}`,
				yAxisColumn: yAxis
			})
		}
		// 散点图
		if (scatterKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processScatterChartData(parsedData, { xAxisColumn: xAxis, yAxisColumn: yAxis }),
				id: uuidv4(),
				chartType: "scatter",
				title: `散点图: ${xAxis} vs ${yAxis}`,
				xAxisColumn: xAxis,
				yAxisColumn: yAxis
			})
		}
		// 雷达图
		if (radarKeywords.some(k => userQuery.includes(k))) {
			addChart({
				...processRadarChartData(parsedData, { xAxisColumn: yAxis }),
				id: uuidv4(),
				chartType: "radar",
				title: `雷达图: ${yAxis}`,
				yAxisColumn: yAxis
			})
		}

		await streamResponse(assistantMessage.id, '你只需要说创建成功就可以，不需要提供图片。')
		setIsLoading(false)
	}
	else {
		const rag = JSON.stringify(parsedData)
		await streamResponse(assistantMessage.id, '请你根据以下内容回答用户的问题：' + rag)
		setIsLoading(false)
	}
}

export const streamResponse = async (assistantMessageId: string, additionalContent: string = '') => {
	const { currentMessages, appendMessageContent } = useChatStore.getState()
	// //todo: get enhanced system prompt
	const requestBody = JSON.stringify({
		messages: [
			{
				"role": "system",
				"content": "You are a helpful assistant"
			},
			{
				"role": "user",
				"content": additionalContent
			},
			...currentMessages,

		]
	})
	const response = await fetch('/api/chat', {
		method: 'POST',
		body: requestBody,
		signal: abortController.signal
	})
	if (!response.body) throw new Error("No response body to read from stream");
	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	let buffer = '';
	let messageContent = '';

	try {
		while (true) {
			// Check for abort signal and exit if aborted
			if (abortController.signal.aborted) {
				reader.cancel();
				break;
			}
			const { done, value } = await reader.read();
			if (done) break;

			// Add the new chunk to our buffer
			buffer += decoder.decode(value, { stream: true });

			// Process complete messages from the buffer
			const lines = buffer.split('\n');
			buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

			for (const line of lines) {
				if (!line) continue;

				// Parse the specialized format
				if (line.startsWith('0:"')) {
					// Extract the content between quotes and handle escaping
					const content = line.substring(3, line.length - 1)
						.replace(/\\"/g, '"')
						.replace(/\\n/g, '\n');

					messageContent += content;
					appendMessageContent(assistantMessageId, content);
				}
			}
		}

		// Process any remaining data in the buffer
		if (buffer) {
			appendMessageContent(assistantMessageId, buffer);
		}

	} catch (error) {
		if (error instanceof Error && error.name !== 'AbortError') {
			console.error('Error processing chat stream:', error);
			throw error;
		}
	}
};

/**
 * Cancel any ongoing message streaming
 */
export const cancelMessageStream = (): void => {
	abortController.abort();
};
