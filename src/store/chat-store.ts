import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Message } from "ai/react";

import {
	ChatOptions,
	getLocalStorageChats,
	saveChatMessages,
	sendChatMessage,
	cancelMessageStream,
	clearAllChatData,
	generateChatId,
} from "@/utils/chat/chat-utils";

/**
 * Chat state interface
 * Manages all state related to chat features
 */
interface ChatState {
	// Input state
	input: string;
	setInput: (input: string) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

	// UI state
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;

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
	currentMessages: Message[];
	setMessages: (chatId: string, messages: Message[]) => void;
	setCurrentMessages: (messagesOrUpdater: Message[] | ((messages: Message[]) => Message[])) => void;
	clearAllChats: () => void;

	// Chat actions
	sendMessage: () => void;
	stopMessageGeneration: () => void;

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
			// Input state
			input: "",
			setInput: (input) => set({ input }),
			handleInputChange: (e) => set({ input: e.target.value }),

			// UI state
			isLoading: false,
			setIsLoading: (isLoading) => set({ isLoading }),

			// Chat options
			chatOptions: {
				selectedModel: "",
				systemPrompt: "You are a helpful AI assistant.",
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
					input: ""
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
			setCurrentMessages: (messagesOrUpdater) => {
				// Handle both direct message array and updater function
				const newMessages = typeof messagesOrUpdater === 'function'
					? messagesOrUpdater(get().currentMessages)
					: messagesOrUpdater;

				set({ currentMessages: newMessages });

				// If we have a current chat ID, also update the messages record
				const currentChatId = get().currentChatId;
				if (currentChatId) {
					set((state) => ({
						messages: { ...state.messages, [currentChatId]: newMessages },
					}));
					saveChatMessages(currentChatId, newMessages);
				}
			},

			clearAllChats: () => {
				clearAllChatData();

				// Clear messages from store
				set({
					messages: {},
					currentChatId: "",
					currentMessages: [],
					input: ""
				});
			},

			// Chat actions
			sendMessage: async () => {
				const state = get();
				const {
					input,
					currentMessages,
					chatOptions,
					currentChatId
				} = state;

				// Get the system prompt
				const systemPrompt = state.getSystemPrompt(currentChatId);

				// Call the utility function to handle sending the message
				await sendChatMessage(
					input,
					currentMessages,
					chatOptions,
					currentChatId,
					systemPrompt,
					{
						setIsLoading: state.setIsLoading,
						setCurrentMessages: state.setCurrentMessages,
						setCurrentChatId: state.setCurrentChatId,
						setInput: state.setInput,
						setError: state.setError
					}
				);
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
