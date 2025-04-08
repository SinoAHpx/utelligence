"use client";

import { useEffect } from "react";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatStore } from "@/store/chatStore";
import Chat from "./chat";

interface ChatPageProps {
    chatId?: string;
    setChatId?: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatPage({ chatId, setChatId }: ChatPageProps = {}) {
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

    // Sync the chatId from props with the store
    useEffect(() => {
        if (chatId && chatId !== currentChatId) {
            setCurrentChatId(chatId);
        }
    }, [chatId, currentChatId, setCurrentChatId]);

    // Update the URL chatId when store changes
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
}
