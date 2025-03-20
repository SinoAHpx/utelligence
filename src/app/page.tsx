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
        <main className="flex h-[calc(100dvh)] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
            {/* Left Column */}
            <div className="flex flex-col w-[45%] h-full rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
                <div className="flex justify-center items-center py-4 border-b border-gray-200 dark:border-gray-700">
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
            <div className="flex flex-col w-[55%] h-full items-center justify-center bg-gray-50 dark:bg-gray-900/20 ml-4 rounded-lg">
                <FileUpload onFileChange={handleFileChange} />
            </div>
        </main>
    );
}
