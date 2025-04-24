import { Message } from "ai/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
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

/**
 * Create a new user message
 * @param content The message content
 * @returns A new Message object
 */
export const createUserMessage = (content: string): Message => {
  return {
    id: uuidv4(),
    role: 'user',
    content: content
  };
};

/**
 * Create a new assistant message (empty, to be filled with stream)
 * @returns A new Message object for the assistant
 */
export const createAssistantMessage = (): Message => {
  return {
    id: uuidv4(),
    role: 'assistant',
    content: ''
  };
};

/**
 * Send a message to the chat API and process the streaming response
 * 
 * @param messages Current messages to send to API
 * @param chatOptions Chat configuration options
 * @param systemPrompt System prompt to use
 * @param onStreamChunk Callback for each chunk of the stream response
 * @param onComplete Callback when streaming is complete
 * @param onError Callback for error handling
 */
export const sendMessageToAPI = async (
  messages: Message[],
  chatOptions: ChatOptions,
  systemPrompt: string,
  onStreamChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${basePath}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        chatOptions: {
          ...chatOptions,
          systemPrompt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Process the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body reader could not be obtained');
    }

    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const result = await reader.read();
      done = result.done;

      if (done) {
        onComplete();
        break;
      }

      // Decode the chunk and append to the message
      const chunk = decoder.decode(result.value, { stream: true });
      onStreamChunk(chunk);
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
    toast.error(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
  }
};

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
 * Generate a new chat ID
 * @returns A new UUID for a chat
 */
export const generateChatId = (): string => {
  return uuidv4();
};

/**
 * Abort controller for canceling ongoing requests
 */
let abortController: AbortController | null = null;

/**
 * Send a chat message and handle the response stream
 * @param input User input text
 * @param currentMessages Current message history
 * @param chatOptions Chat configuration
 * @param chatId Current chat ID (optional, will generate one if not provided)
 * @param systemPrompt System prompt to use
 * @param callbacks Callbacks for state updates
 * @returns The ID of the chat
 */
export const sendChatMessage = async (
  input: string,
  currentMessages: Message[],
  chatOptions: ChatOptions,
  chatId: string | null,
  systemPrompt: string,
  callbacks: {
    setIsLoading: (loading: boolean) => void;
    setCurrentMessages: (messagesOrUpdater: Message[] | ((messages: Message[]) => Message[])) => void;
    setCurrentChatId: (id: string) => void;
    setInput: (input: string) => void;
    setError: (error: string | undefined) => void;
  }
): Promise<string> => {
  const { setIsLoading, setCurrentMessages, setCurrentChatId, setInput, setError } = callbacks;

  // Validate input
  if (!input.trim() || !chatOptions.selectedModel) {
    return chatId || '';
  }

  // Set loading state
  setIsLoading(true);

  // Generate a chat ID if needed
  const effectiveChatId = chatId || generateChatId();
  if (!chatId) {
    setCurrentChatId(effectiveChatId);
  }

  try {
    // Create the user message
    const userMessage = createUserMessage(input);

    // Add user message to the conversation
    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);

    // Clear input after sending
    setInput('');

    // Create empty assistant message
    const assistantMessage = createAssistantMessage();
    const messagesWithAssistant = [...updatedMessages, assistantMessage];
    setCurrentMessages(messagesWithAssistant);

    // Cancel any previous requests
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller
    abortController = new AbortController();

    // Send the message to the API
    await sendMessageToAPI(
      updatedMessages,
      chatOptions,
      systemPrompt,
      // Handle each chunk of the response
      (chunk) => {
        setCurrentMessages((currentMsgs) => {
          const updatedMsgs = [...currentMsgs];
          // Update the last message (assistant's response)
          const lastMessage = updatedMsgs[updatedMsgs.length - 1];
          lastMessage.content += chunk;
          return updatedMsgs;
        });
      },
      // Handle completion
      () => {
        setIsLoading(false);
        abortController = null;
      },
      // Handle errors
      (error) => {
        setIsLoading(false);
        setError(error.message);
        abortController = null;
      }
    );

    // Save messages to local storage (will be done by the store)
    return effectiveChatId;
  } catch (error) {
    // Handle any unexpected errors
    setIsLoading(false);
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    toast.error(`Something went wrong: ${errorMessage}`);
    return effectiveChatId;
  }
};

/**
 * Cancel any ongoing message streaming
 */
export const cancelMessageStream = (): void => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
};
