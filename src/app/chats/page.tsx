"use client";

import { useChatStore } from "@/store/chat-store";
import type { Chats } from "@/utils/chat/chat-utils";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatsPage() {
	const { getGroupedChats } = useChatStore();
	const [chats, setChats] = useState<Chats>({});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadChats = () => {
			const loadedChats = getGroupedChats();
			setChats(loadedChats);
			setIsLoading(false);
		};

		loadChats();

		const handleStorageChange = () => {
			loadChats();
		};

		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, [getGroupedChats]);

	return (
		<div className="container mx-auto max-w-5xl py-8 px-4 md:px-0">
			{" "}
			{/* Added padding for smaller screens */}
			<div className="flex items-center mb-8">
				<Link href="/" className="flex items-center gap-2 text-primary hover:underline">
					<ArrowLeftIcon className="w-4 h-4" />
					<span>返回</span>
				</Link>
				<h1 className="text-2xl font-bold ml-4">聊天历史</h1>
			</div>
			{isLoading ? (
				<div className="text-center py-8 text-gray-500">加载中...</div>
			) : Object.keys(chats).length > 0 ? (
				// Render grouped chats
				<div className="space-y-6">
					{Object.entries(chats).map(([group, chatsInGroup]) => (
						<div key={group}>
							<h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
								{group}
							</h2>
							<div className="grid gap-4">
								{chatsInGroup.map((chat) => {
									// Get the first user message as the title, or use a default
									const firstUserMessage = chat.messages.find((msg) => msg.role === "user");
									const title = firstUserMessage
										? firstUserMessage.content.substring(0, 60) +
											(firstUserMessage.content.length > 60 ? "..." : "")
										: `对话 ${chat.chatId.substring(5, 13)}`; // Use chatId substring

									// Extract raw chat ID for the link
									const rawChatId = chat.chatId.replace("chat_", "");

									return (
										<Link
											// Use rawChatId for the link query parameter
											href={`/?chatId=${rawChatId}`}
											key={chat.chatId}
											className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition block" // Added block display
										>
											<div className="font-medium truncate">{title}</div> {/* Added truncate */}
											{/* Optional: Keep ID and message count if needed */}
											{/* <div className="text-sm text-gray-500 mt-1">
                                                ID: {rawChatId.substring(0, 8)}...
                                            </div> */}
											<div className="text-sm text-gray-500 mt-1">
												消息数: {chat.messages.length}
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-8 text-gray-500">
					没有聊天记录
					<div className="flex items-center justify-center mt-4">
						{" "}
						{/* Added margin-top */}
						<Link
							href="/"
							className="flex items-center gap-2 text-primary hover:underline" // Ensure text-primary is used
						>
							<PlusCircle size={20} /> {/* Ensure PlusCircle icon is used */}
							新建聊天
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
