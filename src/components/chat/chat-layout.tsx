"use client";

import React, { useEffect, useState } from "react";
import Chat from "./chat";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatStore } from "@/store/chatStore";

interface ChatLayoutProps {
    defaultLayout?: number[];
    defaultCollapsed?: boolean;
    navCollapsedSize?: number;
}

export function ChatLayout({
    defaultLayout = [30, 160],
    defaultCollapsed = false,
    navCollapsedSize = 768,
}: ChatLayoutProps) {
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

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check
        checkScreenWidth();

        // Event listener for screen width changes
        window.addEventListener("resize", checkScreenWidth);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

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
