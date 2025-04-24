import { useEffect } from "react";
import { useChat } from "ai/react";
import { ChatRequestOptions } from "ai";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { useChatStore } from "@/store/chatStore";
import { basePath } from "@/utils/utils";


/**
 * Custom hook for all chat-related actions
 * Manages chat state, message handling, and API interactions
 */
export const useChatActions = () => {
	const {
		chatOptions,
		currentChatId,
		setCurrentChatId,
		messages: storedMessages,
		setMessages,
		getSystemPrompt,
	} = useChatStore();

	// Initialize the AI chat hook
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit: aiHandleSubmit,
		isLoading,
		error,
		stop,
		setMessages: setAiMessages,
	} = useChat({
		api: basePath + "/api/chat",
		streamMode: "stream-data",
		onError: (error) => {
			toast.error("Something went wrong: " + error);
		},
	});

	/**
	 * Load messages from store when chat ID changes
	 */
	useEffect(() => {
		if (currentChatId && storedMessages[currentChatId]) {
			setAiMessages(storedMessages[currentChatId]);
		} else {
			setAiMessages([]);
		}
	}, [currentChatId, storedMessages, setAiMessages]);

	/**
	 * Save messages to store when they change
	 */
	useEffect(() => {
		if (currentChatId && messages.length > 0 && !isLoading) {
			setMessages(currentChatId, messages);
		}
	}, [messages, currentChatId, isLoading, setMessages]);

	/**
	 * Handle chat submission with proper options
	 */
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// If this is a new chat, generate a chat ID
		if (!currentChatId) {
			const newChatId = uuidv4();
			setCurrentChatId(newChatId);
		}

		// Get the system prompt for the current chat
		// This uses either the per-chat stored system prompt or falls back to the global default
		const chatId = currentChatId || uuidv4();
		const systemPrompt = getSystemPrompt(chatId);

		// Prepare the options object with additional body data for the model
		const requestOptions: ChatRequestOptions = {
			options: {
				body: {
					chatOptions: {
						...chatOptions,
						systemPrompt: systemPrompt,
					},
				},
			},
		};

		// Submit the chat
		aiHandleSubmit(e, requestOptions);
	};

	/**
	 * Create a new chat session
	 */
	const createNewChat = () => {
		// Clear the current chat ID to start a new chat
		setCurrentChatId("");
		setAiMessages([]);
	};

	return {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		isLoading,
		error,
		stop,
		createNewChat,
	};
};
