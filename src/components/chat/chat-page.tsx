"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
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
 * - Uses Zustand for state management
 * - Renders the main chat interface
 */
const ChatPage = ({ chatId, setChatId }: ChatPageProps = {}) => {
    const { currentChatId, setCurrentChatId } = useChatStore();

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
                <Chat />
            </div>
        </div>
    );
};

export default ChatPage;
