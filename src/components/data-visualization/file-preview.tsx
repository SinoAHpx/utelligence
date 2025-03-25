"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface FilePreviewProps {
  file: File | null;
  maxRows?: number;
}

interface ParsedData {
  headers: string[];
  data: string[][];
}

export default function FilePreview({ file, maxRows = 20 }: FilePreviewProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-hidden">
        <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          文件预览 ({file.name})
        </h3>
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
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
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis max-w-[200px]"
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
