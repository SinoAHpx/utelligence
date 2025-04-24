import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Message } from "ai/react";
import {
	ChatOptions,
	getLocalStorageChats,
	saveChatMessages,
} from "@/utils/chat/chat-utils";

/**
 * Chat state interface
 * Manages all state related to chat features
 */
interface ChatState {
	// Chat options
	chatOptions: ChatOptions;
	setChatOptions: (options: ChatOptions) => void;

	// Chat state
	currentChatId: string;
	setCurrentChatId: (id: string) => void;
	createNewChat: () => void;

	// System prompts per chat
	systemPrompts: Record<string, string>;
	setSystemPrompt: (chatId: string, systemPrompt: string) => void;
	getSystemPrompt: (chatId: string) => string;

	// Messages
	messages: Record<string, Message[]>;
	setMessages: (chatId: string, messages: Message[]) => void;
	clearAllChats: () => void;

	// Chat history
	getGroupedChats: () => ReturnType<typeof getLocalStorageChats>;

	// Error state
	error: string | undefined;
	setError: (error: string | undefined) => void;
}

/**
 * Zustand store for chat functionality
 * Persists chat options to localStorage
 */
export const useChatStore = create<ChatState>()(
	persist(
		(set, get) => ({
			// Chat options
			chatOptions: {
				selectedModel: "",
				systemPrompt: "",
				temperature: 0.9,
			},
			setChatOptions: (options) => set({ chatOptions: options }),

			// Chat state
			currentChatId: "",
			setCurrentChatId: (id) => set({ currentChatId: id }),
			createNewChat: () => set({ currentChatId: "" }),

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
			setMessages: (chatId, messages) => {
				if (!chatId) return;

				// Update the messages in the store
				set((state) => ({
					messages: { ...state.messages, [chatId]: messages },
				}));

				// Save to localStorage and trigger event
				saveChatMessages(chatId, messages);
			},

			clearAllChats: () => {
				// Clear all chat_ items from local storage
				if (typeof window !== "undefined") {
					Object.keys(localStorage)
						.filter((key) => key.startsWith("chat_"))
						.forEach((key) => localStorage.removeItem(key));

					// Trigger the storage event
					window.dispatchEvent(new Event("storage"));
				}

				// Clear messages from store
				set({ messages: {}, currentChatId: "" });
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
