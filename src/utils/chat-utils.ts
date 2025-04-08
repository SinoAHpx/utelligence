import { Message } from "ai/react";
import { basePath } from "@/lib/utils";

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
 * Fetch available models from the server
 * @returns Array of available model names
 */
export const fetchAvailableModels = async (): Promise<{
	models: string[];
	error?: string;
}> => {
	try {
		const res = await fetch(basePath + "/api/models");

		if (!res.ok) {
			const errorResponse = await res.json();
			const errorMessage = `Connection to vLLM server failed: ${errorResponse.error} [${res.status} ${res.statusText}]`;
			return { models: [], error: errorMessage };
		}

		const data = await res.json();
		const modelNames = data.data.map((model: any) => model.id);
		return { models: modelNames };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch models";
		return { models: [], error: errorMessage };
	}
};

/**
 * Fetch the token limit from the server
 * @returns Token limit number
 */
export const fetchTokenLimit = async (): Promise<number> => {
	try {
		const response = await fetch(basePath + "/api/token-limit");
		const data = await response.json();
		return data.limit || 4096; // Default to 4096 if not found
	} catch (error) {
		console.error("Error fetching token limit:", error);
		return 4096; // Default token limit
	}
};

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
 * Group chats by date for display
 * @param chats Array of chat objects
 * @returns Grouped chats by date
 */
export const groupChatsByDate = (
	chats: { chatId: string; messages: Message[] }[],
): Record<string, { chatId: string; messages: Message[] }[]> => {
	const groupedChats: Record<
		string,
		{ chatId: string; messages: Message[] }[]
	> = {};

	chats.forEach((chat) => {
		// Get the date from the first message
		const firstMessage = chat.messages[0];
		if (!firstMessage) return;

		const date = new Date(firstMessage.createdAt || Date.now());
		const dateStr = date.toLocaleDateString(undefined, {
			month: "long",
			day: "numeric",
		});

		// Add to the appropriate group
		if (!groupedChats[dateStr]) {
			groupedChats[dateStr] = [];
		}

		groupedChats[dateStr].push(chat);
	});

	return groupedChats;
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
