import React from "react";
import { useChatStore } from "@/store/chat-store";

import ChatBottombar from "./bottom-bar";
import ChatList from "./chat-list";
import ChatTopbar from "./topbar";

/**
 * Main Chat component that composes the whole chat interface
 * 
 * Features:
 * - Uses Zustand store for state management
 * - Integrates chat topbar, message list, and input bar
 * - No prop drilling - all components access store directly
 */
const Chat = () => {
    return (
        <div className="flex flex-col justify-between w-full h-full">
            <ChatTopbar />
            <ChatList />
            <ChatBottombar />
        </div>
    );
};

export default Chat;
