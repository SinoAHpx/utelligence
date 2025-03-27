import React, { useEffect, useRef } from "react";
import { Message } from "ai";

import EmptyState from "./empty-state";
import MessageItem from "./message-item";
import ScrollbarStyles from "../ui/scrollbar-styles";

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
}

/**
 * Main chat list component that displays all messages
 * Handles auto-scrolling and empty state
 */
export default function ChatList({ messages, isLoading }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        id="scroller"
        className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(156, 163, 175, 0.3) transparent",
        }}
      >
        <div className="px-4 py-2">
          {messages
            .filter((message) => message.role !== "system")
            .map((message, index, filteredMessages) => (
              <MessageItem
                key={index}
                message={message}
                isLastMessage={index === filteredMessages.length - 1}
                isLoading={isLoading}
              />
            ))}
          <div id="anchor" ref={bottomRef} className="h-4"></div>
        </div>
      </div>
      <ScrollbarStyles />
    </div>
  );
}
