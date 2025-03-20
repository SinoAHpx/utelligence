"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export default function ChatsPage() {
    const [chats, setChats] = useState<{ id: string; messages: any[] }[]>([]);

    useEffect(() => {
        // Load chat history from localStorage
        const loadChats = () => {
            const chatIds: { id: string; messages: any[] }[] = [];
            // Iterate through localStorage to find chat items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("chat_")) {
                    try {
                        const chatId = key.replace("chat_", "");
                        const messages = JSON.parse(
                            localStorage.getItem(key) || "[]"
                        );
                        if (messages.length > 0) {
                            chatIds.push({ id: chatId, messages });
                        }
                    } catch (error) {
                        console.error("Error parsing chat history:", error);
                    }
                }
            }
            setChats(chatIds);
        };

        loadChats();
        window.addEventListener("storage", loadChats);
        return () => window.removeEventListener("storage", loadChats);
    }, []);

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="flex items-center mb-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>返回</span>
                </Link>
                <h1 className="text-2xl font-bold ml-4">聊天历史</h1>
            </div>

            <div className="grid gap-4">
                {chats.length > 0 ? (
                    chats.map((chat) => {
                        // Get the first user message as the title, or use a default
                        const firstUserMessage = chat.messages.find(
                            (msg) => msg.role === "user"
                        );
                        const title = firstUserMessage
                            ? firstUserMessage.content.substring(0, 60) +
                              (firstUserMessage.content.length > 60
                                  ? "..."
                                  : "")
                            : `对话 ${chat.id.substring(0, 8)}`;

                        return (
                            <Link
                                href={`/?chatId=${chat.id}`}
                                key={chat.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                <div className="font-medium">{title}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    ID: {chat.id.substring(0, 8)}...
                                </div>
                                <div className="text-sm text-gray-500">
                                    消息数: {chat.messages.length}
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        没有聊天记录
                    </div>
                )}
            </div>
        </div>
    );
}
