"use client";

import React, { useEffect } from "react";

import {
    GearIcon,
    ChevronDownIcon,
    InfoCircledIcon,
    Pencil1Icon,
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
    }, [hasMounted]);

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

    const chatName = chatId ? `对话 ${chatId.substring(0, 8)}` : "新对话";

    return (
        <div className="w-full flex px-4 py-4 items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <Link
                    href="/chats"
                    className="text-blue-600 hover:underline font-medium"
                >
                    {chatName}
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="mr-2">
                            {currentModel || "选择模型"}
                        </span>
                        <ChevronDownIcon className="w-4 h-4" />
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

            <div className="flex items-center gap-4">
                <div className="flex items-end gap-2">
                    {chatTokens > tokenLimit && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span>
                                        <InfoCircledIcon className="w-4 h-4 text-blue-500" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    sideOffset={4}
                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm text-xs"
                                >
                                    <p className="text-gray-500">
                                        token 限制已超出。将截断中间消息。
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {messages.length > 0 && (
                        <span className="text-xs text-gray-500">
                            {chatTokens} / {tokenLimit} 个 token
                        </span>
                    )}
                </div>

                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Pencil1Icon className="w-4 h-4" />
                    <span>新建聊天</span>
                </button>
            </div>
        </div>
    );
}
