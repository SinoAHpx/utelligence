import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message } from 'ai/react';
import { ChatOptions } from '@/components/chat/chat-options';
import { basePath } from '@/lib/utils';
import { Chats, groupChatsByDate } from '@/lib/chatUtils';

interface ChatState {
  // Chat options
  chatOptions: ChatOptions;
  setChatOptions: (options: ChatOptions) => void;
  
  // Chat state
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  createNewChat: () => void;
  
  // Models
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;
  fetchModels: () => Promise<void>;
  
  // Token limits
  tokenLimit: number;
  setTokenLimit: (limit: number) => void;
  
  // Messages
  messages: Record<string, Message[]>;
  setMessages: (chatId: string, messages: Message[]) => void;
  clearAllChats: () => void;
  
  // Chat history
  getGroupedChats: () => Chats;
  
  // Error state
  error: string | undefined;
  setError: (error: string | undefined) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Chat options
      chatOptions: {
        selectedModel: '',
        systemPrompt: '',
        temperature: 0.9,
      },
      setChatOptions: (options) => set({ chatOptions: options }),
      
      // Chat state
      currentChatId: '',
      setCurrentChatId: (id) => set({ currentChatId: id }),
      createNewChat: () => set({ currentChatId: '' }),
      
      // Models
      availableModels: [],
      setAvailableModels: (models) => set({ availableModels: models }),
      fetchModels: async () => {
        try {
          const res = await fetch(basePath + "/api/models");
          
          if (!res.ok) {
            const errorResponse = await res.json();
            const errorMessage = `Connection to vLLM server failed: ${errorResponse.error} [${res.status} ${res.statusText}]`;
            set({ error: errorMessage });
            return;
          }
          
          const data = await res.json();
          const modelNames = data.data.map((model: any) => model.id);
          set({ availableModels: modelNames });
          
          // If no model is selected yet, set the first available model
          const { chatOptions } = get();
          if (!chatOptions.selectedModel && modelNames.length > 0) {
            set({
              chatOptions: { ...chatOptions, selectedModel: modelNames[0] }
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch models',
            chatOptions: { ...get().chatOptions, selectedModel: undefined }
          });
        }
      },
      
      // Token limits
      tokenLimit: 4096,
      setTokenLimit: (limit) => set({ tokenLimit: limit }),
      
      // Messages
      messages: {},
      setMessages: (chatId, messages) => {
        if (!chatId) return;
        
        // Update the messages in the store
        set((state) => ({ 
          messages: { ...state.messages, [chatId]: messages } 
        }));
        
        // Save to local storage with chat_ prefix
        const storageKey = `chat_${chatId}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
        
        // Trigger the storage event for other components to detect changes
        window.dispatchEvent(new Event('storage'));
      },
      
      clearAllChats: () => {
        // Clear all chat_ items from local storage
        Object.keys(localStorage)
          .filter(key => key.startsWith('chat_'))
          .forEach(key => localStorage.removeItem(key));
        
        // Clear messages from store
        set({ messages: {}, currentChatId: '' });
        
        // Trigger the storage event
        window.dispatchEvent(new Event('storage'));
      },
      
      // Chat history
      getGroupedChats: () => {
        // This function mimics the behavior of getLocalstorageChats from chatUtils
        if (typeof localStorage === 'undefined') {
          return {};
        }
        
        const chatKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('chat_')
        );
        
        if (chatKeys.length === 0) {
          return {};
        }
        
        const chatObjects = chatKeys
          .map(chatKey => {
            const item = localStorage.getItem(chatKey);
            try {
              const messages = item ? JSON.parse(item) : [];
              if (Array.isArray(messages) && messages.length > 0) {
                return { chatId: chatKey, messages: messages as Message[] };
              }
            } catch (error) {
              console.error(`Error parsing localStorage item ${chatKey}:`, error);
            }
            return null;
          })
          .filter((chat): chat is { chatId: string; messages: Message[] } => chat !== null);
        
        // Sort chats by date (most recent first)
        chatObjects.sort((a, b) => {
          const aDate = new Date(a.messages[0]?.createdAt ?? 0);
          const bDate = new Date(b.messages[0]?.createdAt ?? 0);
          return bDate.getTime() - aDate.getTime();
        });
        
        // Group chats by date
        return groupChatsByDate(chatObjects);
      },
      
      // Error state
      error: undefined,
      setError: (error) => set({ error }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chatOptions: state.chatOptions,
        // Don't store messages or available models in persisted state
        // as they're already managed separately
      }),
    }
  )
);