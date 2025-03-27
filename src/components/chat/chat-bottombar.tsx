"use client";

import React from "react";

import { PaperPlaneIcon, StopIcon } from "@radix-ui/react-icons";
import { ChatRequestOptions } from "ai";
import llama3Tokenizer from "llama3-tokenizer-js";
import dynamic from "next/dynamic";

import { basePath, useHasMounted } from "@/lib/utils";
import { getTokenLimit } from "@/lib/token-counter";
import { Button } from "../ui/button";

// Dynamically import TextareaAutosize with SSR disabled
const TextareaAutosize = dynamic(() => import("react-textarea-autosize"), {
    ssr: false,
});

interface ChatBottombarProps {
    selectedModel: string | undefined;
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        chatRequestOptions?: ChatRequestOptions
    ) => void;
    isLoading: boolean;
    stop: () => void;
}

export default function ChatBottombar({
    selectedModel,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
}: ChatBottombarProps) {
    const hasMounted = useHasMounted();
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const hasSelectedModel = selectedModel && selectedModel !== "";

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey &&
            hasSelectedModel &&
            !isLoading
        ) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    return (
        <div className="px-6 md:px-10">
            <div className="stretch flex flex-row gap-3 last:mb-2 md:last:mb-6 md:mx-auto md:max-w-2xl xl:max-w-3xl">
                <div key="input" className="w-full relative mb-1 items-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full items-center flex relative gap-2"
                    >
                        <TextareaAutosize
                            autoComplete="off"
                            value={input}
                            ref={inputRef}
                            onKeyDown={handleKeyPress}
                            onChange={handleInputChange}
                            name="message"
                            placeholder="您有什么问题..."
                            className="border-input max-h-48 px-4 py-4 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-md flex items-center h-14 resize-none overflow-hidden dark:bg-card/35 pr-32"
                        />
                        {!isLoading ? (
                            <Button
                                size="icon"
                                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                                type="submit"
                                disabled={
                                    isLoading ||
                                    !input.trim() ||
                                    !hasSelectedModel
                                }
                            >
                                <PaperPlaneIcon className="w-5 h-5 text-white dark:text-black" />
                            </Button>
                        ) : (
                            <Button
                                size="icon"
                                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                                onClick={stop}
                            >
                                <StopIcon className="w-5 h-5 text-white dark:text-black" />
                            </Button>
                        )}
                    </form>
                </div>
            </div>
            <div className="relative px-2 py-2 text-center text-xs text-slate-500 md:px-[60px]">
                <span>按回车发送，Shift + 回车换行</span>
            </div>
        </div>
    );
}
