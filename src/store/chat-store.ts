import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Message, useChat } from "ai/react";

import {
	ChatOptions,
	getLocalStorageChats,
	saveChatMessages,
	cancelMessageStream,
	clearAllChatData,
	createMessage
} from "@/utils/chat/chat-utils";

/**
 * Chat state interface
 * Manages all state related to chat features
 */
export interface ChatState {
	/** 是否正在加载 */
	isLoading: boolean;
	/** 设置加载状态 */
	setIsLoading: (isLoading: boolean) => void;

	/** 聊天选项 */
	chatOptions: ChatOptions;
	/** 设置聊天选项 */
	setChatOptions: (options: ChatOptions) => void;

	/** 当前聊天ID */
	currentChatId: string;
	/** 设置当前聊天ID */
	setCurrentChatId: (id: string) => void;
	/** 创建新聊天 */
	createNewChat: () => void;

	/** 每个聊天的系统提示 */
	systemPrompts: Record<string, string>;
	/** 设置指定聊天的系统提示 */
	setSystemPrompt: (chatId: string, systemPrompt: string) => void;
	/** 获取指定聊天的系统提示 */
	getSystemPrompt: (chatId: string) => string;

	/** 聊天消息记录，按聊天ID分组 */
	messages: Record<string, Message[]>;
	/** 当前聊天的消息 */
	currentMessages: Message[];
	/** 设置指定聊天的消息 */
	setMessages: (chatId: string, messages: Message[]) => void;
	/** 设置当前聊天的消息 */
	setCurrentMessages: (messagesOrUpdater: Message[]) => void;
	/** 清除所有聊天记录 */
	clearAllChats: () => void;
	appendMessageContent: (id: string, content: string) => void;
	/** 处理发送消息的行为 */
	sendMessage: (message: string) => void;
	/** 停止消息生成 */
	stopMessageGeneration: () => void;

	/** 获取分组后的聊天历史 */
	getGroupedChats: () => ReturnType<typeof getLocalStorageChats>;

	/** 错误信息 */
	error: string | undefined;
	/** 设置错误信息 */
	setError: (error: string | undefined) => void;
}

/**
 * Zustand store for chat functionality
 * Persists chat options to localStorage
 */
export const useChatStore = create<ChatState>()(
	persist(
		(set, get) => ({
			// UI state
			isLoading: false,
			setIsLoading: (isLoading) => set({ isLoading }),

			// Chat options
			chatOptions: {
				selectedModel: "",
				systemPrompt: "你是孔子，你回答任何问题都只会用文言文。",
				temperature: 0.9,
			},
			setChatOptions: (options) => set({ chatOptions: options }),

			// Chat state
			currentChatId: "",
			setCurrentChatId: (id) => {
				set({ currentChatId: id });
				// Load messages for this chat ID
				const state = get();
				if (id && state.messages[id]) {
					set({ currentMessages: state.messages[id] });
				} else {
					set({ currentMessages: [] });
				}
			},

			createNewChat: () => {
				set({
					currentChatId: "",
					currentMessages: [],
				});
			},

			// System prompts per chat
			systemPrompts: {},
			setSystemPrompt: (chatId, systemPrompt) => {
				if (!chatId) return;
				set((state) => ({
					systemPrompts: { ...state.systemPrompts, [chatId]: systemPrompt },
				}));
			},
			getSystemPrompt: (chatId) => {
				const state = get();
				if (!chatId) return state.chatOptions.systemPrompt;
				return state.systemPrompts[chatId] || state.chatOptions.systemPrompt;
			},

			// Messages
			messages: {},
			currentMessages: [],
			setMessages: (chatId, messages) => {
				if (!chatId) return;

				// Update the messages in the store
				set((state) => ({
					messages: { ...state.messages, [chatId]: messages },
				}));

				// Save to localStorage and trigger event
				saveChatMessages(chatId, messages);
			},
			setCurrentMessages: (messages) => {
				set({ currentMessages: messages });

				// If we have a current chat ID, also update the messages record
				const currentChatId = get().currentChatId;
				if (currentChatId) {
					set((state) => ({
						messages: { ...state.messages, [currentChatId]: messages },
					}));
					saveChatMessages(currentChatId, messages);
				}
			},

			clearAllChats: () => {
				clearAllChatData();

				// Clear messages from store
				set({
					messages: {},
					currentChatId: "",
					currentMessages: [],
				});
			},
			appendMessageContent: (id: string, content: string) => {
				const updatedCurrentMessages = get().currentMessages.map((message) => {
					if (message.id == id) return {...message, content: `${message.content}${content}`}
					else return message
				});

				set(() => ({
					currentMessages: updatedCurrentMessages,
				}));

				saveChatMessages(get().currentChatId, updatedCurrentMessages);
			},

			sendMessage: async (message: string) => {
				createMessage(message)


			},

			stopMessageGeneration: () => {
				cancelMessageStream();
				set({ isLoading: false });
			},

			// Chat history - uses the utility function
			getGroupedChats: () => getLocalStorageChats(),

			// Error state
			error: undefined,
			setError: (error) => set({ error }),
		}),
		{
			name: "chat-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				chatOptions: state.chatOptions,
				systemPrompts: state.systemPrompts,
				// Don't store messages or available models in persisted state
				// as they're already managed separately
			}),
		},
	),
);
