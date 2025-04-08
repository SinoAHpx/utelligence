"use client";

import { useEffect, memo } from "react";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatStore } from "@/store/chatStore";
import Chat from "./chat";

/**
 * Props interface for the ChatPage component
 */
type ChatPageProps = {
    chatId?: string;
    setChatId?: React.Dispatch<React.SetStateAction<string>>;
};

/**
 * ChatPage component coordinates between URL state and chat store
 * 
 * Features:
 * - Syncs chatId between URL and global store
 * - Handles chat state via useChatActions hook
 * - Renders the main chat interface
 */
const ChatPage = memo(({ chatId, setChatId }: ChatPageProps = {}) => {
    const { currentChatId, setCurrentChatId } = useChatStore();
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
        stop,
        createNewChat,
    } = useChatActions();

    // Sync URL chatId with store when props change
    useEffect(() => {
        if (chatId && chatId !== currentChatId) {
            setCurrentChatId(chatId);
        }
    }, [chatId, currentChatId, setCurrentChatId]);

    // Update URL when store chatId changes
    useEffect(() => {
        if (setChatId && currentChatId !== chatId) {
            setChatId(currentChatId);
        }
    }, [currentChatId, chatId, setChatId]);

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
                <Chat
                    messages={messages}
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                    stop={stop}
                    createNewChat={createNewChat}
                />
            </div>
        </div>
    );
});

ChatPage.displayName = "ChatPage";

export default ChatPage;
