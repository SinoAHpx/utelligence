import { Message } from "ai/react";
import { basePath } from "@/utils/utils";


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

// Function to get and group chats from localStorage
export const getLocalstorageChats = (): Chats => {
  // Check if localStorage is available (for server-side rendering or environments where it's not)
  if (typeof localStorage === "undefined") {
    return {};
  }

  const chatKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("chat_")
  );

  if (chatKeys.length === 0) {
    return {}; // Return empty object if no chats
  }

  // Map through the chats and return an object with chatId and messages
  const chatObjects = chatKeys
    .map((chatKey) => {
      const item = localStorage.getItem(chatKey);
      try {
        // Use chatKey directly as chatId, assuming format "chat_..."
        const messages = item ? JSON.parse(item) : [];
        // Basic validation for messages array and first message's createdAt
        if (
          Array.isArray(messages) &&
          messages.length > 0 &&
          messages[0]?.createdAt
        ) {
          return { chatId: chatKey, messages: messages as Message[] };
        }
      } catch (error) {
        console.error(`Error parsing localStorage item ${chatKey}:`, error);
      }
      return null; // Return null for invalid/empty chats
    })
    .filter(
      (chat): chat is { chatId: string; messages: Message[] } => chat !== null
    ); // Filter out nulls and type guard

  // Sort chats by the createdAt date of the first message of each chat
  chatObjects.sort((a, b) => {
    // Dates are validated in the map step, but add fallback just in case
    const aDate = new Date(a.messages[0]?.createdAt ?? 0);
    const bDate = new Date(b.messages[0]?.createdAt ?? 0);
    return bDate.getTime() - aDate.getTime();
  });

  // Group the valid, sorted chats
  const groupedChats = groupChatsByDate(chatObjects);

  return groupedChats;
};
