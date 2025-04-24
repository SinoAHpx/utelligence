"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { processFileData } from "@/utils/data/data-processing";
import { StatisticsTab } from "./statistical-analysis/statistics-tab";
import { CorrelationTab } from "./statistical-analysis/correlation-tab";
import { calculateDescriptiveStatistics } from "@/utils/data/statistics";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";
import { convertToNumericArray } from "@/utils/data/statistics/utils";
import { InferentialStatisticsTab } from "./statistical-analysis/inferential-statistics/inferential-tab";
import { RegressionTab } from "./statistical-analysis/regression-tab";
import { fileDataStore } from "@/store/index";
import { useFileUploadStore } from "@/store/file-upload-store";

interface DataAnalysisProps {
  file: File | null;
}

export default function DataAnalysis({
  file,
}: DataAnalysisProps) {
  const [activeTab, setActiveTab] = useState<string>("statistics");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [columnData, setColumnData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get parsed data from FilePreviewStore
  const { parsedData } = useFileUploadStore();
  // Use the Zustand store for accessing parsedData
  const { processAndAnalyzeFile } = fileDataStore();

  // Get all available columns
  const allColumns = parsedData?.headers || [];

  const tabOptions = [
    { id: "statistics", name: "统计描述" },
    { id: "inferential", name: "推断性统计" },
    { id: "correlation", name: "相关性分析" },
    { id: "regression", name: "回归分析" },
  ];

  // Ensure file data is loaded in the store
  useEffect(() => {
    if (file && (!parsedData || parsedData.headers.length === 0)) {
      processAndAnalyzeFile(file, allColumns)
        .catch((error) => {
          console.error("DataAnalysis: Error processing file data:", error);
          setErrorMessage(`处理文件出错: ${error}`);
        });
    }
  }, [file, parsedData, allColumns, processAndAnalyzeFile]);

  // Fetch column data when the selected column changes
  useEffect(() => {
    if (!file || !selectedColumn) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Use parsedData from the store if available
    if (parsedData && parsedData.headers.includes(selectedColumn)) {
      const colIndex = parsedData.headers.indexOf(selectedColumn);
      const colData = parsedData.rows.map(row => row[colIndex]);
      setColumnData(colData);

      // Check if there are enough numeric values in the column
      const numericData = convertToNumericArray(colData);
      if (numericData.length === 0) {
        setErrorMessage(`列 "${selectedColumn}" 不包含有效的数值数据，请选择一个包含数值的列。`);
        setStatsData([]);
      } else if (numericData.length < (colData.length * 0.3)) {
        setErrorMessage(`列 "${selectedColumn}" 中只有 ${numericData.length}/${colData.length} (${Math.round(numericData.length / colData.length * 100)}%) 是有效的数值数据，这可能会影响分析结果的准确性。`);
        // Calculate statistics anyway
        const stats = calculateDescriptiveStatistics(colData);
        setStatsData(stats);
      } else {
        // Calculate statistics
        const stats = calculateDescriptiveStatistics(colData);
        setStatsData(stats);
      }
      setIsLoading(false);
    } else {
      // Fallback to processing file directly if not in store
      processFileData(
        file,
        (data) => {
          const headers = data.headers;
          const rows = data.rows;

          const colIndex = headers.indexOf(selectedColumn);
          if (colIndex !== -1) {
            const colData = rows.map(row => row[colIndex]);
            setColumnData(colData);

            // Check if there are enough numeric values in the column
            const numericData = convertToNumericArray(colData);
            if (numericData.length === 0) {
              setErrorMessage(`列 "${selectedColumn}" 不包含有效的数值数据，请选择一个包含数值的列。`);
              setStatsData([]);
            } else if (numericData.length < (colData.length * 0.3)) {
              setErrorMessage(`列 "${selectedColumn}" 中只有 ${numericData.length}/${colData.length} (${Math.round(numericData.length / colData.length * 100)}%) 是有效的数值数据，这可能会影响分析结果的准确性。`);
              // Calculate statistics anyway
              const stats = calculateDescriptiveStatistics(colData);
              setStatsData(stats);
            } else {
              // Calculate statistics
              const stats = calculateDescriptiveStatistics(colData);
              setStatsData(stats);
            }
          }

          setIsLoading(false);
        },
        (error) => {
          console.error("Error processing file:", error);
          setErrorMessage(`处理文件出错: ${error}`);
          setIsLoading(false);
        }
      );
    }
  }, [file, selectedColumn, parsedData]);

  useEffect(() => {
    // When available columns change, default to the first column
    if (allColumns.length > 0 && !allColumns.includes(selectedColumn)) {
      setSelectedColumn(allColumns[0]);
    }
  }, [allColumns, selectedColumn]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">数据分析</CardTitle>
          <CardDescription>对选定数据进行详细的统计分析</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="statistics" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                {tabOptions.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeTab !== "regression" && (
                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择分析列" />
                  </SelectTrigger>
                  <SelectContent>
                    {allColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {errorMessage && activeTab !== "regression" && (
              <Alert className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="statistics" className="mt-6">
              <StatisticsTab
                statsData={statsData}
                isLoading={isLoading}
                columnData={columnData}
                columnName={selectedColumn}
              />
            </TabsContent>

            <TabsContent value="inferential" className="mt-6">
              <InferentialStatisticsTab
                isLoading={isLoading}
                columnData={columnData}
                columnName={selectedColumn}
              />
            </TabsContent>

            <TabsContent value="correlation" className="mt-6">
              <CorrelationTab availableColumns={allColumns} file={file} />
            </TabsContent>

            <TabsContent value="regression" className="mt-6">
              <RegressionTab
                file={file}
                availableColumns={allColumns}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
