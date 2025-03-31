"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface FilePreviewProps {
  file: File | null;
  maxRows?: number;
  onColumnsAvailable?: (columns: string[]) => void;
}

interface ParsedData {
  headers: string[];
  data: string[][];
}

export default function FilePreview({
  file,
  maxRows = 20,
  onColumnsAvailable,
}: FilePreviewProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const processedFileRef = React.useRef("");

  useEffect(() => {
    if (!file) return;

    // 避免重复处理相同的文件
    const fileKey = `${file.name}-${file.size}`;

    // 检查是否已处理过该文件
    if (fileKey === processedFileRef.current) {
      return; // 如果是同一个文件，不重复处理
    }

    processedFileRef.current = fileKey;

    setIsLoading(true);
    setError(null);
    // 不要在这里重置selectedColumns，避免用户选择的列被清空
    // setSelectedColumns([]);

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    const processFile = async () => {
      try {
        if (fileExtension === "csv") {
          // 处理CSV文件
          const text = await file.text();
          Papa.parse(text, {
            complete: (results) => {
              const headers = results.data[0] as string[];
              const data = results.data.slice(1, maxRows + 1) as string[][];
              setParsedData({ headers, data });
              setIsLoading(false);

              // 通知父组件可用的列，但不自动选择
              if (onColumnsAvailable && headers.length > 0) {
                // 只在第一次加载时设置可用列
                if (selectedColumns.length === 0) {
                  onColumnsAvailable(headers);
                }
              }
            },
            error: (error) => {
              setError(`解析CSV文件失败: ${error.message}`);
              setIsLoading(false);
            },
          });
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          // 处理Excel文件
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // 转换为JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // 提取表头和数据
          const headers = jsonData[0] as string[];
          const data = jsonData.slice(1, maxRows + 1) as string[][];

          setParsedData({ headers, data });
          setIsLoading(false);

          // 通知父组件可用的列，但不自动选择
          if (onColumnsAvailable && headers.length > 0) {
            // 只在第一次加载时设置可用列
            if (selectedColumns.length === 0) {
              onColumnsAvailable(headers);
            }
          }
        } else {
          setError("不支持的文件类型");
          setIsLoading(false);
        }
      } catch (err) {
        setError(
          `文件解析错误: ${err instanceof Error ? err.message : String(err)}`
        );
        setIsLoading(false);
      }
    };

    processFile();
  }, [file, maxRows]);

  const toggleColumnSelection = (column: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            文件预览 ({file.name})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleVisualize}
              disabled={selectedColumns.length === 0}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedColumns.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {selectedColumns.length === 0
                ? "请选择至少一列"
                : `可视化 (${selectedColumns.length}列)`}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
            选择需要可视化的列：
          </h4>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            {parsedData.headers.map((header, index) => (
              <button
                key={index}
                onClick={() => toggleColumnSelection(header)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedColumns.includes(header)
                    ? "bg-blue-600 text-white"
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
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {parsedData.headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      selectedColumns.includes(header)
                        ? "bg-blue-50 dark:bg-blue-900/20"
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
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis max-w-[200px] ${
                        selectedColumns.includes(parsedData.headers[cellIndex])
                          ? "bg-blue-50 dark:bg-blue-900/10"
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
  );
}
