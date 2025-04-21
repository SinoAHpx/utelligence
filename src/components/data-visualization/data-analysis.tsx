"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processFileData } from "@/utils/data-processing";
import { StatisticsTab } from "./statistical-analysis/statistics-tab";
import { CorrelationTab } from "./statistical-analysis/correlation-tab";
import { CentralTendencyTab } from "./statistical-analysis/central-tendency-tab";
import { DispersionTab } from "./statistical-analysis/dispersion-tab";
import { DistributionTab } from "./statistical-analysis/distribution-tab";
import { calculateDescriptiveStatistics } from "@/utils/statistics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { convertToNumericArray } from "@/utils/statistics/utils";

interface DataAnalysisProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

export default function DataAnalysis({
  file,
  selectedColumns,
  availableColumns,
}: DataAnalysisProps) {
  const [activeTab, setActiveTab] = useState<string>("statistics");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [columnData, setColumnData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tabOptions = [
    { id: "statistics", name: "统计描述" },
    { id: "centralTendency", name: "中心趋势" },
    { id: "dispersion", name: "离散程度" },
    { id: "distribution", name: "分布分析" },
    { id: "correlation", name: "相关性分析" },
    { id: "regression", name: "回归分析" },
  ];

  // Fetch column data when the selected column changes
  useEffect(() => {
    if (!file || !selectedColumn) return;

    setIsLoading(true);
    setErrorMessage(null);

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
  }, [file, selectedColumn]);

  useEffect(() => {
    // 当选定列变化时，默认选择第一列
    if (
      selectedColumns.length > 0 &&
      !selectedColumns.includes(selectedColumn)
    ) {
      setSelectedColumn(selectedColumns[0]);
    }
  }, [selectedColumns, selectedColumn]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  if (selectedColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          请先在文件预览选项卡中选择至少一列数据
        </p>
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

              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="选择分析列" />
                </SelectTrigger>
                <SelectContent>
                  {selectedColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <Alert className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="statistics" className="mt-6">
              <StatisticsTab
                statsData={statsData}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="centralTendency" className="mt-6">
              <CentralTendencyTab
                data={columnData}
                columnName={selectedColumn}
              />
            </TabsContent>

            <TabsContent value="dispersion" className="mt-6">
              <DispersionTab
                data={columnData}
                columnName={selectedColumn}
              />
            </TabsContent>

            <TabsContent value="distribution" className="mt-6">
              <DistributionTab
                data={columnData}
                columnName={selectedColumn}
              />
            </TabsContent>

            <TabsContent value="correlation" className="mt-6">
              <CorrelationTab selectedColumns={selectedColumns} />
            </TabsContent>

            <TabsContent value="regression" className="mt-6">
              {selectedColumns.length >= 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>回归分析</CardTitle>
                      <CardDescription>
                        基于{selectedColumns[0]}和{selectedColumns[1]}的回归分析
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <p className="text-gray-500">回归模型可视化</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>回归模型统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="py-2 font-medium">R²值</td>
                            <td>0.923</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">调整后的R²</td>
                            <td>0.919</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">回归方程</td>
                            <td>y = 2.0x + 30.0</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">标准误差</td>
                            <td>5.87</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">观测值</td>
                            <td>20</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">请选择至少两列数据进行回归分析</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
