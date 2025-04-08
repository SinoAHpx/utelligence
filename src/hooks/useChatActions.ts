import { useEffect } from 'react';
import { useChat, ChatRequestOptions } from 'ai/react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { useChatStore } from '@/store/chatStore';
import { basePath } from '@/lib/utils';
import { getTokenLimit } from '@/lib/token-counter';

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

  // Fetch models and token limit on mount
  useEffect(() => {
    fetchModels();
    getTokenLimit(basePath).then((limit) => setTokenLimit(limit));
  }, [fetchModels, setTokenLimit]);

  // Load messages from store when chat ID changes
  useEffect(() => {
    if (currentChatId && storedMessages[currentChatId]) {
      setAiMessages(storedMessages[currentChatId]);
    } else {
      setAiMessages([]);
    }
  }, [currentChatId, storedMessages, setAiMessages]);

  // Save messages to store when they change
  useEffect(() => {
    if (currentChatId && messages.length > 0 && !isLoading) {
      setMessages(currentChatId, messages);
      
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event('storage'));
    }
  }, [messages, currentChatId, isLoading, setMessages]);

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

  const createNewChat = () => {
    // Clear the current chat ID to start a new chat
    setCurrentChatId('');
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