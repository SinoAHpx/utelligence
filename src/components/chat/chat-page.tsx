"use client";

import React from "react";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatStore } from "@/store/chatStore";
import Chat from "./chat";

export default function ChatPage() {
    const { currentChatId } = useChatStore();
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
