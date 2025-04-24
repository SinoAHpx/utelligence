"use client";

import React, { useMemo, memo } from "react";
import {
  GearIcon,
  Pencil1Icon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import { Message } from "ai/react";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog";
import Settings from "@/components/settings/settings";
import { useHasMounted } from "@/utils/utils";
import { useChatStore } from "@/store/chat-store";

/**
 * Props for the ChatTopbar component
 */
type ChatTopbarProps = {
  isLoading: boolean;
  messages: Message[];
  createNewChat: () => void;
};



/**
 * SettingsButton component for opening settings dialog
 */
const SettingsButton = memo(({
  chatOptions,
  setChatOptions,
  currentChatId
}: {
  chatOptions: any;
  setChatOptions: (options: any) => void;
  currentChatId: string;
}) => (
  <Dialog>
    <TooltipProvider>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="设置"
            >
              <GearIcon className="w-5 h-5" />
            </button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>
          <p>设置</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>设置</DialogTitle>
      </DialogHeader>
      <Settings
        chatOptions={chatOptions}
        setChatOptions={setChatOptions}
      />
    </DialogContent>
  </Dialog>
));

SettingsButton.displayName = "SettingsButton";

/**
 * ChatTopbar component handles the top navigation bar of the chat interface
 * 
 * Features:
 * - Shows the current chat title
 * - Allows model selection
 * - Provides access to settings
 * - Navigation buttons for chat list and creating new chats
 */
const ChatTopbar = memo(({
  messages,
  createNewChat,
}: ChatTopbarProps) => {
  const hasMounted = useHasMounted();

  const {
    chatOptions,
    setChatOptions,
    currentChatId,
  } = useChatStore();

  // Get chat title from first user message or fallback to ID
  const chatTitle = useMemo(() => {
    const firstUserMessage = messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      return firstUserMessage.content.length > 30
        ? `${firstUserMessage.content.substring(0, 30)}...`
        : firstUserMessage.content;
    }
    return currentChatId
      ? `对话 ${currentChatId.substring(0, 8)}`
      : "新对话";
  }, [messages, currentChatId]);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="w-full flex px-4 py-4 items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4 overflow-hidden">
        <span className="font-medium text-lg truncate max-w-[140px] md:max-w-[200px] lg:max-w-[240px]">
          {chatTitle}
        </span>

        <SettingsButton
          chatOptions={chatOptions}
          setChatOptions={setChatOptions}
          currentChatId={currentChatId}
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Link
          href="/chats"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="对话列表"
        >
          <ChatBubbleIcon className="w-4 h-4 shrink-0" />
          <span className="hidden [320px]:inline">对话列表</span>
        </Link>

        <button
          onClick={createNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="新建聊天"
        >
          <Pencil1Icon className="w-4 h-4 shrink-0" />
          <span className="hidden [320px]:inline">新建聊天</span>
        </button>
      </div>
    </div>
  );
});

ChatTopbar.displayName = "ChatTopbar";

export default ChatTopbar;
