"use client";

import React, { useRef, useState } from "react";
import { Upload, FileX } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { useFilePreviewStore } from "@/store/filePreviewStore";

export default function FileUploader() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { setFile, processFile } = useFilePreviewStore();

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const selectedFile = files[0];
            // 检查文件类型
            const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
            if (fileExtension === "csv" || fileExtension === "xlsx" || fileExtension === "xls") {
                // 更新存储中的文件并处理
                setFile(selectedFile);
                processFile(selectedFile);
            } else {
                alert("请上传 CSV 或 Excel 文件");
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center h-48 transition-colors ${isDragging
                ? "border-primary bg-primary/10"
                : "border-gray-300 dark:border-gray-700"
                }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
            />

            {isDragging ? (
                <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-primary animate-bounce" />
                    <p className="mt-2 text-sm text-primary">释放鼠标上传文件</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        <FileX className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        拖拽CSV或Excel文件到此处，或
                    </p>
                    <Button onClick={handleButtonClick} variant="secondary" size="sm">
                        选择文件
                    </Button>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        支持 .csv, .xlsx, .xls 格式
                    </p>
                </div>
            )}
        </div>
    );
} 