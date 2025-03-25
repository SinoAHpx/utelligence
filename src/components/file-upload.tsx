"use client";

import React, { useState } from "react";
import { UploadIcon } from "@radix-ui/react-icons";

interface FileUploadProps {
  onFileChange?: (file: File) => void;
}

const supportedFileTypes = [
  { extension: "csv", description: "CSV文件" },
  { extension: "xls", description: "Excel文件" },
  { extension: "xlsx", description: "Excel文件" },
];

export default function FileUpload({ onFileChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const isValid = supportedFileTypes.some(
      (type) => type.extension === extension
    );

    if (!isValid) {
      setError(
        `不支持的文件类型: .${extension}。请选择以下类型: ${supportedFileTypes
          .map((t) => `.${t.extension}`)
          .join(", ")}`
      );
    } else {
      setError("");
    }

    return isValid;
  };

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

      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
        if (onFileChange) {
          onFileChange(uploadedFile);
        }
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];

      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
        if (onFileChange) {
          onFileChange(uploadedFile);
        }
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
              : error
              ? "border-red-400 bg-red-50 dark:bg-red-900/10"
              : "border-gray-300 dark:border-gray-700"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon
          className={`w-10 h-10 mb-4 ${
            error ? "text-red-400" : "text-gray-400"
          }`}
        />
        <p className="mb-2 text-sm text-center text-gray-500 dark:text-gray-400">
          <span className="font-semibold">点击上传</span> 或拖拽文件
        </p>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          支持 CSV、XLS、JSON 或其他数据格式
        </p>

        {error && (
          <p className="mt-2 text-xs text-center text-red-500">{error}</p>
        )}

        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept={supportedFileTypes
            .map((type) => `.${type.extension}`)
            .join(",")}
        />

        <label
          htmlFor="file-upload"
          className={`mt-4 px-4 py-2 text-white text-sm font-medium rounded-md cursor-pointer ${
            error
              ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          选择文件
        </label>
      </div>

      {file && (
        <div className="mt-4 w-full">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            已选择文件:
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 truncate max-w-[80%]">
              {file.name}
            </p>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {file.name.split(".").pop()?.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {file.size < 1024
              ? `${file.size} B`
              : file.size < 1024 * 1024
              ? `${(file.size / 1024).toFixed(2)} KB`
              : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
          </p>
        </div>
      )}
    </div>
  );
}
