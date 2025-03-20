import React, { useEffect, useRef } from "react";

import Image from "next/image";

import OllamaLogo from "../../../public/ucass_logo.png";
import CodeDisplayBlock from "../code-display-block";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "ai";

interface ChatListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageToolbar = () => (
    <div className="mt-1 flex gap-3 empty:hidden juice:flex-row-reverse">
        <div className="text-gray-400 flex self-end lg:self-center items-center justify-center lg:justify-start mt-0 -ml-1 h-7 gap-[2px] invisible">
            <span>Regenerate</span>
            <span>Edit</span>
        </div>
    </div>
);

export default function ChatList({ messages, isLoading }: ChatListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (messages.length === 0) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col gap-4 items-center">
                    <Image
                        src={OllamaLogo}
                        alt="AI"
                        width={450}
                        height={400}
                        draggable="false"
                        className="object-contain dark:invert"
                    />
                    <p className="text-center text-xl text-muted-foreground">
                        祝你早安, 午安, 晚安。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden relative">
            <div
                id="scroller"
                className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(156, 163, 175, 0.3) transparent",
                }}
            >
                <div className="px-4 py-2">
                    {messages
                        .filter((message) => message.role !== "system")
                        .map((message, index) => (
                            <div
                                key={index}
                                className="flex flex-col w-full py-4 border-b border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                                            {message.role === "user" ? (
                                                <div className="dark:invert h-full w-full bg-black" />
                                            ) : (
                                                <Image
                                                    src={OllamaLogo}
                                                    alt="AI"
                                                    className="object-contain dark:invert aspect-square h-full w-full"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {message.role === "user" && (
                                        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                                            <div className="font-semibold pb-2">
                                                You
                                            </div>
                                            <div className="break-words">
                                                {message.content}
                                            </div>
                                            <MessageToolbar />
                                        </div>
                                    )}
                                    {message.role === "assistant" && (
                                        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                                            <div className="font-semibold pb-2">
                                                Assistant
                                            </div>
                                            <div className="break-words overflow-hidden">
                                                <span className="whitespace-pre-wrap">
                                                    {/* Check if the message content contains a code block */}
                                                    {message.content
                                                        .split("```")
                                                        .map((part, index) => {
                                                            if (
                                                                index % 2 ===
                                                                0
                                                            ) {
                                                                return (
                                                                    <Markdown
                                                                        key={
                                                                            index
                                                                        }
                                                                        remarkPlugins={[
                                                                            remarkGfm,
                                                                        ]}
                                                                        className="prose dark:prose-invert max-w-full"
                                                                    >
                                                                        {part}
                                                                    </Markdown>
                                                                );
                                                            } else {
                                                                return (
                                                                    <CodeDisplayBlock
                                                                        key={
                                                                            index
                                                                        }
                                                                        code={part.trim()}
                                                                        lang=""
                                                                    />
                                                                );
                                                            }
                                                        })}
                                                    {isLoading &&
                                                        messages.indexOf(
                                                            message
                                                        ) ===
                                                            messages.length -
                                                                1 && (
                                                            <span
                                                                className="animate-pulse"
                                                                aria-label="Typing"
                                                            >
                                                                ...
                                                            </span>
                                                        )}
                                                </span>
                                            </div>
                                            <MessageToolbar />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    <div id="anchor" ref={bottomRef} className="h-4"></div>
                </div>
            </div>
            <style jsx global>{`
                /* 定义自定义滚动条样式 */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                .scrollbar-thumb-transparent::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    transition: background-color 0.3s;
                }

                .hover\:scrollbar-thumb-gray-300:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(209, 213, 219, 0.5);
                }

                .dark
                    .dark\:hover\:scrollbar-thumb-gray-700:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(55, 65, 81, 0.5);
                }

                .scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
                    border-radius: 3px;
                }

                .scrollbar-track-transparent::-webkit-scrollbar-track {
                    background-color: transparent;
                }

                /* Firefox 滚动条样式 */
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: transparent transparent;
                }

                .scrollbar-thin:hover {
                    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
                }
            `}</style>
        </div>
    );
}
