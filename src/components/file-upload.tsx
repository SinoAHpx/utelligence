"use client";

import React, { useState } from "react";
import { UploadIcon } from "@radix-ui/react-icons";

interface FileUploadProps {
    onFileChange?: (file: File) => void;
}

export default function FileUpload({ onFileChange }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const uploadedFile = e.dataTransfer.files[0];
            setFile(uploadedFile);
            if (onFileChange) {
                onFileChange(uploadedFile);
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);
            if (onFileChange) {
                onFileChange(uploadedFile);
            }
        }
    };

    return (
        <div className="w-full max-w-md p-8 flex flex-col items-center">
            <div
                className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors
          ${
              isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700"
          }
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-center text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">点击上传</span> 或拖拽文件
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    支持 CSV、XLS、JSON 或其他文档格式
                </p>

                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                />

                <label
                    htmlFor="file-upload"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md 
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                    上传文件
                </label>
            </div>

            {file && (
                <div className="mt-4 w-full">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        已选择文件:
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                        {file.name}
                    </p>
                </div>
            )}
        </div>
    );
}
