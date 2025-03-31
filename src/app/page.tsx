"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatPage from "@/components/chat/chat-page";
import DataPanel from "@/components/data-panel";

export default function Home() {
  const searchParams = useSearchParams();
  const [chatId, setChatId] = React.useState<string>("");

  // Get chatId from URL parameters when navigating from chat history
  useEffect(() => {
    const urlChatId = searchParams.get("chatId");
    if (urlChatId) {
      setChatId(urlChatId);
    }
  }, [searchParams]);

  return (
    <main className="flex flex-col lg:flex-row h-[calc(100dvh)] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
      {/* Left Column - Chat */}
      <div className="flex flex-col w-full lg:w-[30%] lg:flex-shrink-0 lg:flex-grow-0 h-full rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex-1">
          <ChatPage chatId={chatId} setChatId={setChatId} />
        </div>
      </div>

      {/* Right Column - Data Panel */}
      <div className="flex-1 h-full lg:ml-4 mt-4 lg:mt-0">
        <DataPanel />
      </div>
    </main>
  );
}
