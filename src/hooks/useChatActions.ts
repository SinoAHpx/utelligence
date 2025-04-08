import { useEffect } from "react";
import { useChat } from "ai/react";
import { ChatRequestOptions } from "ai";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { useChatStore } from "@/store/chatStore";
import { basePath } from "@/lib/utils";
import {
	fetchTokenLimit,
	fetchAvailableModels,
	saveChatMessages,
} from "@/utils/chat-utils";

/**
 * Custom hook for all chat-related actions
 * Manages chat state, message handling, and API interactions
 */
export const useChatActions = () => {
	const {
		chatOptions,
		currentChatId,
		setCurrentChatId,
		fetchModels,
		setTokenLimit,
		messages: storedMessages,
		setMessages,
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
	 * Fetch models and token limit on mount
	 */
	useEffect(() => {
		const loadModelsAndLimits = async () => {
			// Fetch models
			const { models, error } = await fetchAvailableModels();
			if (error) {
				toast.error(error);
			} else if (models.length > 0) {
				useChatStore.getState().setAvailableModels(models);

				// Set default model if none selected
				if (!chatOptions.selectedModel) {
					useChatStore.getState().setChatOptions({
						...chatOptions,
						selectedModel: models[0],
					});
				}
			}

			// Fetch token limit
			const limit = await fetchTokenLimit();
			setTokenLimit(limit);
		};

		loadModelsAndLimits();
	}, [chatOptions, setTokenLimit]);

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

		// Prepare the options object with additional body data for the model
		const requestOptions: ChatRequestOptions = {
			options: {
				body: {
					chatOptions,
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
