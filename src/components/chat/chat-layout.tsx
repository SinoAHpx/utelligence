"use client";

import React, { useEffect, useState, memo } from "react";
import Chat from "./chat";
import { useChatActions } from "@/utils/hooks/useChatActions";

/**
 * Props for the ChatLayout component
 */
type ChatLayoutProps = {
    navCollapsedSize?: number;
};

/**
 * ChatLayout component manages responsive layout for the chat interface
 * 
 * Features:
 * - Handles mobile vs desktop layout detection
 * - Wraps the Chat component with responsive layout
 * - Passes chat action props to the Chat component
 */
export const ChatLayout = memo(({
    navCollapsedSize = 768,
}: ChatLayoutProps) => {
    const [isMobile, setIsMobile] = useState(false);
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

    // Handle responsive layout detection
    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= navCollapsedSize);
        };

        // Initial check
        checkScreenWidth();

        // Add resize listener
        window.addEventListener("resize", checkScreenWidth);

        // Cleanup
        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, [navCollapsedSize]);

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
