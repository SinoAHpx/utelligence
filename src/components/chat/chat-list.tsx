import { useChatStore } from "@/store/chat-store";
import { useEffect, useRef } from "react";

import EmptyState from "./empty-state";
import MessageItem from "./message-item";

/**
 * ChatList component displays all chat messages and handles scrolling behavior
 *
 * Features:
 * - Uses Zustand store for state management
 * - Automatically scrolls to the bottom when new messages arrive
 * - Shows an empty state when no messages exist
 * - Filters out system messages from the display
 * - Optimized scrolling performance
 */
const ChatList = () => {
	const { currentMessages: messages, isLoading } = useChatStore();
	const bottomRef = useRef<HTMLDivElement>(null);

	// Scroll to the bottom of the message list
	const scrollToBottom = () => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
		}
	};

	// Auto-scroll when messages change or when loading state changes
	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	// Show empty state when no messages exist
	if (messages.length === 0) {
		return <EmptyState />;
	}

	// Filter out system messages for display
	const displayMessages = messages.filter((message) => message.role !== "system");

	return (
		<div className="flex-1 overflow-hidden relative">
			<div
				id="message-container"
				className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-700 scrollbar-track-transparent"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "rgba(156, 163, 175, 0.3) transparent",
				}}
			>
				<div className="px-4 py-2">
					{displayMessages.map((message, index) => (
						<MessageItem
							key={message.id || index}
							message={message}
							isLastMessage={index === displayMessages.length - 1}
						/>
					))}
					<div id="scroll-anchor" ref={bottomRef} className="h-4" aria-hidden="true"></div>
				</div>
			</div>
		</div>
	);
};

export default ChatList;
