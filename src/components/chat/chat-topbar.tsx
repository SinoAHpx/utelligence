"use client";

import React, { useEffect } from "react";

import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Message } from "ai/react";
import { toast } from "sonner";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
            // save the first and only model in the list as selectedModel in localstorage
            setChatOptions({ ...chatOptions, selectedModel: modelNames[0] });
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

    return (
        <div className="md:w-full flex px-4 py-4 items-center justify-end">
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
        </div>
    );
}
