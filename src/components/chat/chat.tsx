import React, { memo } from "react";
import { Message } from "ai/react";

import ChatBottombar from "./chat-bottombar";
import ChatList from "./chat-list";
import ChatTopbar from "./chat-topbar";

/**
 * Props for the Chat component
 */
type ChatProps = {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    error: undefined | Error;
    stop: () => void;
    createNewChat: () => void;
};

/**
 * Main Chat component that composes the whole chat interface
 * 
 * Features:
 * - Integrates chat topbar, message list, and input bar
 * - Handles message display and user input
 * - Manages loading states and error handling
 */
const Chat = memo(({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    createNewChat,
}: ChatProps) => {
    return (
        <div className="flex flex-col justify-between w-full h-full">
            <ChatTopbar
                isLoading={isLoading}
                messages={messages}
                createNewChat={createNewChat}
            />

            <ChatList messages={messages} isLoading={isLoading} />

            <ChatBottombar
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
            />
        </div>
    );
});

Chat.displayName = "Chat";

export default Chat;
