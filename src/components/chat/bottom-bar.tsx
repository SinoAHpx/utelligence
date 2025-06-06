"use client";

import React, { useRef, useEffect, ChangeEvent, useState } from "react";
import { PaperPlaneIcon, StopIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";

import { useHasMounted } from "@/utils/utils";
import { Button } from "../ui/shadcn/button";
import { useChatStore } from "@/store/chat-store";

// Dynamically import TextareaAutosize with SSR disabled to avoid hydration issues
const TextareaAutosize = dynamic(() => import("react-textarea-autosize"), {
    ssr: false,
});

/**
 * ChatBottombar handles user input and message submission
 * 
 * Features:
 * - Uses Zustand store for state management
 * - Provides autogrowing textarea for user input
 * - Handles keyboard shortcuts (Enter to submit, Shift+Enter for new line)
 * - Shows send or stop button based on loading state
 * - Validates input before submission
 */
const ChatBottombar = () => {
    const hasMounted = useHasMounted();
    const {
        sendMessage,
        isLoading,
        stopMessageGeneration,
    } = useChatStore();
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Handle keyboard shortcuts
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !isLoading &&
            input.trim()
        ) {
            e.preventDefault();
            sendMessage(input);
            setInput('')
        }
    };

    // Focus input when component mounts
    useEffect(() => {
        if (hasMounted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [hasMounted]);

    const isSubmitDisabled = isLoading || !input.trim();

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        const userInput = event.target.value
        setInput(userInput)
    }

    return (
        <div className="px-6 md:px-10">
            <div className="stretch flex flex-row gap-3 last:mb-2 md:last:mb-6 md:mx-auto md:max-w-2xl xl:max-w-3xl">
                <div className="w-full relative mb-1 items-center">
                    <form
                        onSubmit={() => {
                            sendMessage(input)
                            setInput('')
                        }}
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
                            aria-label="聊天输入框"
                            className="border-input max-h-48 px-4 py-4 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-md flex items-center h-14 resize-none overflow-hidden dark:bg-card/35 pr-32"
                        />
                        {!isLoading ? (
                            <Button
                                size="icon"
                                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                                type="submit"
                                disabled={isSubmitDisabled}
                                aria-label="发送消息"
                            >
                                <PaperPlaneIcon className="w-5 h-5 text-white dark:text-black" />
                            </Button>
                        ) : (
                            <Button
                                size="icon"
                                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                                onClick={stopMessageGeneration}
                                aria-label="停止生成"
                            >
                                <StopIcon className="w-5 h-5 text-white dark:text-black" />
                            </Button>
                        )}
                    </form>
                </div>
            </div>
            <div className="relative px-2 py-2 text-center text-xs text-slate-500 md:px-[60px]">
                <span>按回车发送, Shift + 回车换行</span>
            </div>
        </div>
    );
};

export default ChatBottombar;
