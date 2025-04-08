"use client";
import React from "react";

import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from "sonner";

import { Button } from "./ui/button";

interface ButtonCodeblockProps {
    code: string;
    lang: string;
}

export default function CodeDisplayBlock({ code, lang }: ButtonCodeblockProps) {
    const [isCopied, setisCopied] = React.useState(false);
    const { theme } = useTheme();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setisCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => {
            setisCopied(false);
        }, 1500);
    };

    return (
        <div className="relative my-4 overflow-hidden rounded-md">
            <SyntaxHighlighter
                language={lang || "text"}
                style={atomDark}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                }}
                showLineNumbers={true}
            >
                {code}
            </SyntaxHighlighter>
            <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="iconSm"
                className="h-6 w-6 absolute top-2 right-2 bg-primary/10 hover:bg-primary/20"
            >
                {isCopied ? (
                    <CheckIcon className="w-4 h-4" />
                ) : (
                    <CopyIcon className="w-4 h-4" />
                )}
            </Button>
        </div>
    );
}
