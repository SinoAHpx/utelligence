"use client";

import React from "react";
import Chat from "./chat";

/**
 * ChatLayout component manages responsive layout for the chat interface
 * 
 * Features:
 * - Uses Zustand store for state management
 * - Handles mobile vs desktop layout detection
 * - Wraps the Chat component with responsive layout
 */
const ChatLayout = () => {
    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
                <Chat />
            </div>
        </div>
    );
};

export default ChatLayout;
