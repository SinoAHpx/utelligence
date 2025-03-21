"use client";

import React, { useEffect, useRef, useState } from "react";

import {
    GearIcon,
    ChevronDownIcon,
    InfoCircledIcon,
    Pencil1Icon,
    ChatBubbleIcon,
} from "@radix-ui/react-icons";
import { Message } from "ai/react";
import Link from "next/link";
import { toast } from "sonner";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { encodeChat, getTokenLimit } from "@/lib/token-counter";
import { basePath, useHasMounted } from "@/lib/utils";
import { ChatOptions } from "./chat-options";

interface ChatTopbarProps {
    chatOptions: ChatOptions;
    setChatOptions: React.Dispatch<React.SetStateAction<ChatOptions>>;
    isLoading: boolean;
    chatId?: string;
    setChatId: React.Dispatch<React.SetStateAction<string>>;
    messages: Message[];
}

export default function ChatTopbar({
    chatOptions,
    setChatOptions,
    isLoading,
    chatId,
    setChatId,
    messages,
}: ChatTopbarProps) {
    const hasMounted = useHasMounted();

    const currentModel = chatOptions && chatOptions.selectedModel;
    const [tokenLimit, setTokenLimit] = React.useState<number>(4096);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [models, setModels] = React.useState<string[]>([]);
    const [showLabels, setShowLabels] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const topbarRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        if (!hasMounted) {
            return null;
        }
        try {
            const res = await fetch(basePath + "/api/models");

            if (!res.ok) {
                const errorResponse = await res.json();
                const errorMessage = `Connection to vLLM server failed: ${errorResponse.error} [${res.status} ${res.statusText}]`;
                throw new Error(errorMessage);
            }

            const data = await res.json();
            // Extract the "name" field from each model object and store them in the state
            const modelNames = data.data.map((model: any) => model.id);
            setModels(modelNames);
            // save the first and only model in the list as selectedModel in localstorage
            if (!chatOptions.selectedModel) {
                setChatOptions({
                    ...chatOptions,
                    selectedModel: modelNames[0],
                });
            }
        } catch (error) {
            setChatOptions({ ...chatOptions, selectedModel: undefined });
            toast.error(error as string);
        }
    };

    useEffect(() => {
        fetchData();
        getTokenLimit(basePath).then((limit) => setTokenLimit(limit));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMounted]);

    useEffect(() => {
        const checkSpace = () => {
            if (topbarRef.current && containerRef.current) {
                const topbarWidth = topbarRef.current.offsetWidth;
                const containerWidth = containerRef.current.offsetWidth;
                const availableSpace = topbarWidth - containerWidth - 250; // 250px buffer for other elements
                setShowLabels(availableSpace > 160); // 160px threshold for showing labels
            }
        };

        // 初始检查
        checkSpace();

        // 窗口大小变化时检查
        window.addEventListener("resize", checkSpace);

        // 使用MutationObserver监听DOM变化
        const observer = new MutationObserver(checkSpace);
        if (topbarRef.current) {
            observer.observe(topbarRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });
        }

        // 定期检查以防其他动态变化
        const intervalId = setInterval(checkSpace, 1000);

        return () => {
            window.removeEventListener("resize", checkSpace);
            observer.disconnect();
            clearInterval(intervalId);
        };
    }, [messages, chatId, models, currentModel]); // 添加关键状态作为依赖项

    if (!hasMounted) {
        return null;
    }

    const chatTokens = messages.length > 0 ? encodeChat(messages) : 0;

    const handleNewChat = () => {
        setChatId("");
    };

    const handleModelChange = (model: string) => {
        setChatOptions({ ...chatOptions, selectedModel: model });
    };

    // 获取对话标题：使用第一条用户消息作为标题
    const firstUserMessage = messages.find((msg) => msg.role === "user");
    const chatTitle = firstUserMessage
        ? firstUserMessage.content.substring(0, 30) +
          (firstUserMessage.content.length > 30 ? "..." : "")
        : chatId
        ? `对话 ${chatId.substring(0, 8)}`
        : "新对话";

    return (
        <div
            ref={topbarRef}
            className="w-full flex px-4 py-4 items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
            <div
                ref={containerRef}
                className="flex items-center space-x-4 overflow-hidden"
            >
                <span className="font-medium text-lg truncate max-w-[140px] md:max-w-[200px] lg:max-w-[240px]">
                    {chatTitle}
                </span>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center px-2 md:px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="mr-2 truncate w-[120px] inline-block overflow-hidden">
                            {currentModel || "选择模型"}
                        </span>
                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {models.map((model) => (
                            <DropdownMenuItem
                                key={model}
                                onClick={() => handleModelChange(model)}
                                className={
                                    currentModel === model
                                        ? "bg-gray-100 dark:bg-gray-800"
                                        : ""
                                }
                            >
                                {model}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <GearIcon className="w-5 h-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>设置</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <Link
                    href="/chats"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <ChatBubbleIcon className="w-4 h-4 flex-shrink-0" />
                    {showLabels && <span>对话列表</span>}
                </Link>

                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Pencil1Icon className="w-4 h-4 flex-shrink-0" />
                    {showLabels && <span>新建聊天</span>}
                </button>
            </div>
        </div>
    );
}
