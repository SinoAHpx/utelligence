import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import Charts from "@/components/data-visualization/charts";

export default function DataPanel() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showCharts, setShowCharts] = useState<boolean>(false);

    const handleFileChange = (file: File) => {
        setUploadedFile(file);
        setShowCharts(true);
        console.log("File uploaded:", file.name);
    };

    return (
        <div className="flex flex-col w-full flex-1 h-full rounded-lg bg-white dark:bg-gray-800 overflow-y-auto">
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
                                        ? `${(uploadedFile.size / 1024).toFixed(
                                              2
                                          )} KB`
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
    );
}
