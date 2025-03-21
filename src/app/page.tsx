"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatPage from "@/components/chat/chat-page";
import FileUpload from "@/components/file-upload";
import Charts from "@/components/data-visualization/charts";

export default function Home() {
    const searchParams = useSearchParams();
    const [chatId, setChatId] = React.useState<string>("");
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
    const [showCharts, setShowCharts] = React.useState<boolean>(false);

    // Get chatId from URL parameters when navigating from chat history
    useEffect(() => {
        const urlChatId = searchParams.get("chatId");
        if (urlChatId) {
            setChatId(urlChatId);
        }
    }, [searchParams]);

    const handleFileChange = (file: File) => {
        setUploadedFile(file);
        setShowCharts(true);
        // Here you can handle the file upload logic, e.g., sending it to an API
        console.log("File uploaded:", file.name);
    };

    return (
        <main className="flex flex-col md:flex-row h-[calc(100dvh)] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
            {/* Left Column */}
            <div className="flex flex-col w-full md:w-auto md:min-w-[350px] lg:min-w-[400px] md:max-w-[45%] h-full rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
                <div className="flex-1">
                    <ChatPage chatId={chatId} setChatId={setChatId} />
                </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col w-full flex-1 h-full md:ml-4 mt-4 md:mt-0 rounded-lg bg-white dark:bg-gray-800 overflow-y-auto">
                {!showCharts ? (
                    <div className="flex items-center justify-center h-full">
                        <FileUpload onFileChange={handleFileChange} />
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        已上传文件:{" "}
                                        <span className="font-bold">
                                            {uploadedFile?.name}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {uploadedFile?.size
                                            ? `${(
                                                  uploadedFile.size / 1024
                                              ).toFixed(2)} KB`
                                            : ""}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCharts(false)}
                                    className="px-3 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    上传新文件
                                </button>
                            </div>
                        </div>
                        <Charts isVisible={showCharts} />
                    </div>
                )}
            </div>
        </main>
    );
}
