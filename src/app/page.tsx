"use client";

import React from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import ChatPage from "@/components/chat/chat-page";
import FileUpload from "@/components/file-upload";

export default function Home() {
    const [chatId, setChatId] = React.useState<string>("");
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

    const handleFileChange = (file: File) => {
        setUploadedFile(file);
        // Here you can handle the file upload logic, e.g., sending it to an API
        console.log("File uploaded:", file.name);
    };

    const handleNewChat = () => {
        setChatId("");
    };

    return (
        <main className="flex h-[calc(100dvh)] w-full overflow-hidden">
            {/* Left Column */}
            <div className="flex flex-col w-1/2 h-full border-r border-gray-200 dark:border-gray-800">
                <div className="flex justify-center items-center py-4">
                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Pencil1Icon className="w-4 h-4" />
                        <span>新建聊天</span>
                    </button>
                </div>
                <div className="flex-1">
                    <ChatPage chatId={chatId} setChatId={setChatId} />
                </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col w-1/2 h-full items-center justify-center bg-gray-50 dark:bg-gray-900/20">
                <FileUpload onFileChange={handleFileChange} />
            </div>
        </main>
    );
}
