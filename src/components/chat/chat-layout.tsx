"use client";

import { memo } from "react";
import Chat from "./chat";
import { useChatActions } from "@/utils/hooks/use-chat-actions";

/**
 * ChatLayout component manages responsive layout for the chat interface
 * 
 * Features:
 * - Handles mobile vs desktop layout detection
 * - Wraps the Chat component with responsive layout
 * - Passes chat action props to the Chat component
 */
export const ChatLayout = memo(() => {
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
});

ChatLayout.displayName = "ChatLayout";
