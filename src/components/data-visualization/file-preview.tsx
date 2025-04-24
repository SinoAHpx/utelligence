"use client";

import React, { useEffect } from "react";
import { useFilePreviewStore } from "@/store/filePreviewStore";

interface FilePreviewProps {
  file: File | null;
  maxRows?: number;
  onColumnsAvailable?: (columns: string[]) => void;
}

export default function FilePreview({
  file,
  maxRows = 30,
  onColumnsAvailable,
}: FilePreviewProps) {
  // Use Zustand store instead of local state
  const {
    parsedData,
    isLoading,
    error,
    selectedColumns,
    processFile,
    toggleColumnSelection,
  } = useFilePreviewStore();

  useEffect(() => {
    if (!file) return;
    // Process file using the store's action
    processFile(file, maxRows);
  }, [file, maxRows, processFile]);

  // Notify parent component about available columns when parsing is done
  useEffect(() => {
    if (parsedData && onColumnsAvailable && parsedData.headers.length > 0) {
      onColumnsAvailable(parsedData.headers);
    }
  }, [parsedData, onColumnsAvailable]);

  const handleVisualize = () => {
    if (selectedColumns.length > 0 && onColumnsAvailable) {
      // 只传递选定的列给父组件
      onColumnsAvailable(selectedColumns);

      // 触发自定义事件，通知父组件用户已选择列并希望可视化
      const event = new CustomEvent("visualize", {
        detail: { columns: selectedColumns },
      });
      window.dispatchEvent(event);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!parsedData || parsedData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">文件中没有数据</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            文件预览 ({file.name})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleVisualize}
              disabled={selectedColumns.length === 0}
              className={`px-3 py-1 text-sm font-medium rounded-md ${selectedColumns.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              {selectedColumns.length === 0
                ? "请选择至少一列"
                : `可视化 (${selectedColumns.length}列)`}
            </button>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
              选择需要可视化的列：
            </h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto overflow-x-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              {parsedData.headers.map((header, index) => (
                <button
                  key={index}
                  onClick={() => toggleColumnSelection(header)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${selectedColumns.includes(header)
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                    }`}
                >
                  {header || `列 ${index + 1}`}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            显示前 {Math.min(parsedData.data.length, maxRows)} 行数据，共{" "}
            {parsedData.data.length} 行
          </div>
          <div className="border rounded-md">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {parsedData.headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${selectedColumns.includes(header)
                        ? "bg-primary/10 dark:bg-primary/20"
                        : ""
                        }`}
                    >
                      {header || `列 ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {parsedData.data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={
                      rowIndex % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    }
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis max-w-[200px] ${selectedColumns.includes(parsedData.headers[cellIndex])
                          ? "bg-primary/10 dark:bg-primary/10"
                          : ""
                          }`}
                        title={String(cell)}
                      >
                        {String(cell) || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
