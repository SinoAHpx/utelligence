import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import DataTabs from "@/components/data-visualization/data-tabs";

export default function DataPanel() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showVisualization, setShowVisualization] = useState<boolean>(false);

    const handleFileChange = (file: File) => {
        setUploadedFile(file);
        setShowVisualization(true);
        console.log("File uploaded:", file.name);
    };

    return (
        <div className="flex flex-col w-full flex-1 h-full rounded-lg bg-white dark:bg-gray-800 overflow-y-auto">
            {!showVisualization ? (
                <div className="flex items-center justify-center h-full">
                    <FileUpload onFileChange={handleFileChange} />
                </div>
            ) : (
                <div className="h-full flex flex-col overflow-hidden">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 shrink-0">
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
                                        ? `${(uploadedFile.size / 1024).toFixed(
                                              2
                                          )} KB`
                                        : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVisualization(false)}
                                className="px-3 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                上传新文件
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <DataTabs file={uploadedFile} />
                    </div>
                </div>
            )}
        </div>
    );
}
