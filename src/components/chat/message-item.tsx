import { useChatStore } from "@/store/chat-store";
import type { Message } from "ai";
import Image from "next/image";
import UCASSLogo from "../../../public/ucass_logo.png";
import { ChatLoadingSkeleton } from "./chat-loading-skeleton";
import MessageFormatter from "./message-formatter";

/**
 * Avatar Components
 * Displays user or assistant avatar based on role
 */
const UserAvatar = () => <div className="dark:invert h-full w-full bg-black" />;

const AssistantAvatar = () => (
	<Image
		src={UCASSLogo}
		alt="AI"
		className="object-contain dark:invert aspect-square h-full w-full"
		priority
	/>
);

type AvatarProps = {
	role: string;
};

const Avatar = ({ role }: AvatarProps) => (
	<div className="shrink-0">
		<div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
			{role === "user" ? <UserAvatar /> : <AssistantAvatar />}
		</div>
	</div>
);

/**
 * Message Content Components
 * Renders different content based on message role
 */
type UserMessageProps = {
	content: string;
};

const UserMessage = ({ content }: UserMessageProps) => (
	<div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full">
		<div className="font-semibold pb-2">You</div>
		<div className="break-words w-full">{content}</div>
	</div>
);

type AssistantMessageProps = {
	content: string;
	isLastMessage: boolean;
};

const AssistantMessage = ({ content, isLastMessage }: AssistantMessageProps) => {
	const { isLoading } = useChatStore();

	return (
		<div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full">
			<div className="font-semibold pb-2">Assistant</div>
			<div className="break-words overflow-hidden w-full">
				<MessageFormatter content={content} />
				{isLoading && isLastMessage && <ChatLoadingSkeleton />}
			</div>
		</div>
	);
};

/**
 * Main Message Item Component
 * Renders a complete chat message with avatar and formatted content
 */
interface MessageItemProps {
	message: Message;
	isLastMessage: boolean;
}

const MessageItem = ({ message, isLastMessage }: MessageItemProps) => (
	<div className="flex flex-col w-full py-4 border-b border-gray-100 dark:border-gray-800">
		<div className="flex items-start gap-3">
			<Avatar role={message.role} />
			{message.role === "user" ? (
				<UserMessage content={message.content} />
			) : (
				<AssistantMessage content={message.content} isLastMessage={isLastMessage} />
			)}
		</div>
	</div>
);

export default MessageItem;
