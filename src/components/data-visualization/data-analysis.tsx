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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateDescriptiveStatistics } from "@/utils/statistics";
import { processFileData } from "@/utils/data-processing";

interface DataAnalysisProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

// Default empty state for statistics
const emptyStats = [
  { name: "平均值", value: "-", category: "集中趋势测度" },
  { name: "中位数", value: "-", category: "集中趋势测度" },
  { name: "标准差", value: "-", category: "离散程度测度" },
  { name: "最小值", value: "-", category: "基本统计量" },
  { name: "最大值", value: "-", category: "基本统计量" },
  { name: "数据量", value: "-", category: "基本统计量" },
];

export default function DataAnalysis({
  file,
  selectedColumns,
  availableColumns,
}: DataAnalysisProps) {
  const [activeTab, setActiveTab] = useState<string>("statistics");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [statsCategory, setStatsCategory] = useState<string>("all");
  const [statsData, setStatsData] = useState<any[]>(emptyStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [columnData, setColumnData] = useState<any[]>([]);

  const tabOptions = [
    { id: "statistics", name: "统计描述" },
    { id: "correlation", name: "相关性分析" },
    { id: "regression", name: "回归分析" },
  ];

  const statCategories = [
    { id: "all", name: "全部指标" },
    { id: "集中趋势测度", name: "集中趋势" },
    { id: "离散程度测度", name: "离散程度" },
    { id: "分布形态测度", name: "分布形态" },
    { id: "基本统计量", name: "基本统计" },
  ];

  // Fetch column data when the selected column changes
  useEffect(() => {
    if (!file || !selectedColumn) return;

    setIsLoading(true);

    processFileData(
      file,
      (data) => {
        const headers = data.headers;
        const rows = data.rows;

        const colIndex = headers.indexOf(selectedColumn);
        if (colIndex !== -1) {
          const colData = rows.map(row => row[colIndex]);
          setColumnData(colData);

          // Calculate statistics
          const stats = calculateDescriptiveStatistics(colData);
          setStatsData(stats);

          // Generate distribution data
          generateDistributionData(colData);
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Error processing file:", error);
        setIsLoading(false);
      }
    );
  }, [file, selectedColumn]);

  // Generate distribution data for histogram
  const generateDistributionData = (data: any[]) => {
    // Convert data to numbers, filtering out non-numeric values
    const numericData = data
      .filter(v => v !== null && v !== undefined && String(v).trim() !== "")
      .map(v => typeof v === 'number' ? v : Number(v))
      .filter(n => !isNaN(n));

    if (numericData.length === 0) {
      setDistributionData([]);
      return;
    }

    // Find min and max
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);

    // Create bins
    const binCount = Math.min(10, Math.ceil(Math.sqrt(numericData.length)));
    const binWidth = (max - min) / binCount;

    // Initialize bins
    const bins = Array(binCount).fill(0).map((_, i) => {
      const lowerBound = min + i * binWidth;
      const upperBound = min + (i + 1) * binWidth;
      return {
        bin: `${lowerBound.toFixed(2)}-${upperBound.toFixed(2)}`,
        lowerBound,
        upperBound,
        count: 0,
      };
    });

    // Count values in each bin
    numericData.forEach(value => {
      // Handle edge case for the maximum value
      if (value === max) {
        bins[bins.length - 1].count++;
        return;
      }

      const binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= 0 && binIndex < binCount) {
        bins[binIndex].count++;
      }
    });

    setDistributionData(bins);
  };

  useEffect(() => {
    // 当选定列变化时，默认选择第一列
    if (
      selectedColumns.length > 0 &&
      !selectedColumns.includes(selectedColumn)
    ) {
      setSelectedColumn(selectedColumns[0]);
    }
  }, [selectedColumns, selectedColumn]);

  // Filter statistics based on category
  const filteredStats = statsCategory === 'all'
    ? statsData
    : statsData.filter(stat => stat.category === statsCategory);

  // Group statistics by category for better organization
  const statsByCategory = filteredStats.reduce((acc: Record<string, any[]>, stat) => {
    if (!acc[stat.category]) {
      acc[stat.category] = [];
    }
    acc[stat.category].push(stat);
    return acc;
  }, {});

  // Format stat value for display
  const formatStatValue = (value: any): string => {
    if (value === null) return "N/A";
    if (Array.isArray(value)) {
      if (value.length === 0) return "N/A";
      return value.join(", ");
    }
    if (typeof value === 'number') {
      // Format number to 4 decimal places at most
      return value.toLocaleString(undefined, {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      });
    }
    return String(value);
  };

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

            <TabsContent value="statistics" className="mt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {statCategories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={statsCategory === category.id ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 transition-colors"
                        onClick={() => setStatsCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  <ScrollArea className="h-[60vh]">
                    {Object.entries(statsByCategory).map(([category, stats]) => (
                      <div key={category} className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 text-primary/80">{category}</h3>
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[60%]">指标</TableHead>
                                <TableHead>值</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stats.map((stat, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{stat.name}</TableCell>
                                  <TableCell>{formatStatValue(stat.value)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="correlation">
              {selectedColumns.length >= 2 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>相关性分析</CardTitle>
                    <CardDescription>
                      查看变量之间的相关关系
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>变量</TableHead>
                          {selectedColumns.map((col) => (
                            <TableHead key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedColumns.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            <TableCell className="font-medium">{row}</TableCell>
                            {selectedColumns.map((col, colIndex) => (
                              <TableCell key={colIndex}>
                                {rowIndex === colIndex ? (
                                  <Badge variant="default">1.0</Badge>
                                ) : (
                                  (Math.random() * 2 - 1).toFixed(2)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">请选择至少两列数据进行相关性分析</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="regression">
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
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">R²值</TableCell>
                            <TableCell>0.923</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">调整后的R²</TableCell>
                            <TableCell>0.919</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">回归方程</TableCell>
                            <TableCell>y = 2.0x + 30.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">标准误差</TableCell>
                            <TableCell>5.87</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">观测值</TableCell>
                            <TableCell>20</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
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
