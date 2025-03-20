"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatPage from "@/components/chat/chat-page";
import FileUpload from "@/components/file-upload";

export default function Home() {
    const searchParams = useSearchParams();
    const [chatId, setChatId] = React.useState<string>("");
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

    // Get chatId from URL parameters when navigating from chat history
    useEffect(() => {
        const urlChatId = searchParams.get("chatId");
        if (urlChatId) {
            setChatId(urlChatId);
        }
    }, [searchParams]);

    const handleFileChange = (file: File) => {
        setUploadedFile(file);
        // Here you can handle the file upload logic, e.g., sending it to an API
        console.log("File uploaded:", file.name);
    };

    return (
        <main className="flex h-[calc(100dvh)] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
            {/* Left Column */}
            <div className="flex flex-col w-[45%] h-full rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
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
