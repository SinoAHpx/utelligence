import React from "react";

import { Message } from "ai/react";

import ChatBottombar from "./chat-bottombar";
import ChatList from "./chat-list";
import ChatTopbar from "./chat-topbar";

export interface ChatProps {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    error: undefined | Error;
    stop: () => void;
    createNewChat: () => void;
}

export default function Chat({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    createNewChat,
}: ChatProps) {
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
}
