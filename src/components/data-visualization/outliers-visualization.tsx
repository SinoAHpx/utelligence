"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InfoIcon, Download, Filter, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    ReferenceLine,
} from "recharts";

interface OutliersVisualizationProps {
    data: any[];
    columnName: string;
    method: string;
    threshold: number;
    statistics: {
        lowerBound: number;
        upperBound: number;
        method: string;
        threshold: number;
        outlierCount: number;
        totalCount: number;
        methodDetails: any;
    };
}

export default function OutliersVisualization({
    data,
    columnName,
    method,
    threshold,
    statistics,
}: OutliersVisualizationProps) {
    const [activeTab, setActiveTab] = useState<string>("chart");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 提取数据值以供可视化
    const getChartData = () => {
        if (!data || data.length === 0) return [];

        // 添加索引和标记是否为异常值
        return data.map((item, index) => {
            const value = Number(item[columnName]);
            const isOutlier =
                value < statistics.lowerBound ||
                value > statistics.upperBound;

            return {
                index,
                value,
                isOutlier,
            };
        });
    };

    const chartData = getChartData();

    // 格式化方法的详细信息
    const formatMethodDetails = () => {
        const { methodDetails } = statistics;
        if (!methodDetails) return [];

        const details = [];
        if (method === "zscore") {
            details.push({ name: "均值", value: methodDetails.mean?.toFixed(4) || "N/A" });
            details.push({ name: "标准差", value: methodDetails.stdDev?.toFixed(4) || "N/A" });
        } else if (method === "iqr") {
            details.push({ name: "Q1 (第一四分位数)", value: methodDetails.q1?.toFixed(4) || "N/A" });
            details.push({ name: "Q3 (第三四分位数)", value: methodDetails.q3?.toFixed(4) || "N/A" });
            details.push({ name: "IQR (四分位距)", value: methodDetails.iqr?.toFixed(4) || "N/A" });
        } else if (method === "percentile") {
            details.push({ name: "下限百分位", value: methodDetails.lowerPercentile || "N/A" });
            details.push({ name: "上限百分位", value: methodDetails.upperPercentile || "N/A" });
        }

        return details;
    };

    // 渲染散点图
    const renderScatterPlot = () => {
        if (chartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-60">
                    <p className="text-gray-500">暂无数据可视化</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="index"
                        name="索引"
                        type="number"
                        domain={[0, 'dataMax']}
                    />
                    <YAxis
                        dataKey="value"
                        name={columnName}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        formatter={(value: any) => [value, columnName]}
                        labelFormatter={(label) => `索引: ${label}`}
                    />
                    <Legend />
                    <ReferenceLine
                        y={statistics.upperBound}
                        stroke="red"
                        strokeDasharray="3 3"
                        label={{ value: `上边界: ${statistics.upperBound.toFixed(2)}`, position: 'right' }}
                    />
                    <ReferenceLine
                        y={statistics.lowerBound}
                        stroke="red"
                        strokeDasharray="3 3"
                        label={{ value: `下边界: ${statistics.lowerBound.toFixed(2)}`, position: 'right' }}
                    />
                    <Scatter
                        name="数据点"
                        data={chartData}
                        fill="#8884d8"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.isOutlier ? "#ff5252" : "#8884d8"}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        );
    };

    // 渲染表格数据
    const renderTable = () => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-60">
                    <p className="text-gray-500">暂无数据</p>
                </div>
            );
        }

        // 仅显示异常值记录
        const outliers = data.filter((item) => {
            const value = Number(item[columnName]);
            return value < statistics.lowerBound || value > statistics.upperBound;
        });

        if (outliers.length === 0) {
            return (
                <Alert>
                    <AlertDescription>未检测到异常值</AlertDescription>
                </Alert>
            );
        }

        // 获取数据的所有列
        const columns = Object.keys(outliers[0]);

        return (
            <ScrollArea className="h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col} className={col === columnName ? "font-bold" : ""}>
                                    {col}
                                    {col === columnName && <Badge className="ml-2 bg-red-500">异常列</Badge>}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {outliers.map((row, rowIndex) => (
                            <TableRow key={`row-${rowIndex}`}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={`cell-${rowIndex}-${col}`}
                                        className={col === columnName ? "font-bold text-red-500" : ""}
                                    >
                                        {row[col]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>异常值分析: {columnName}</CardTitle>
                        <CardDescription>
                            使用 {method === "zscore" ? "Z-Score" : method === "iqr" ? "IQR (四分位距)" : "百分位数"} 方法检测异常值
                            {method === "zscore" && `, 阈值: ${threshold}`}
                            {method === "iqr" && `, 系数: ${threshold}`}
                            {method === "percentile" && `, 百分位: ${threshold}`}
                        </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            导出数据
                        </Button>
                        <Button size="sm" variant="outline">
                            <Filter className="h-4 w-4 mr-1" />
                            筛选
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">检测到的异常值:</p>
                        <p className="text-2xl font-semibold">
                            {statistics.outlierCount} <span className="text-sm text-gray-500">/ {statistics.totalCount}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {((statistics.outlierCount / statistics.totalCount) * 100).toFixed(2)}% 的数据为异常值
                        </p>
                    </div>

                    <div className="col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">下边界:</p>
                        <p className="text-2xl font-semibold">
                            {statistics.lowerBound.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            小于此值的数据点被视为异常值
                        </p>
                    </div>

                    <div className="col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">上边界:</p>
                        <p className="text-2xl font-semibold">
                            {statistics.upperBound.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            大于此值的数据点被视为异常值
                        </p>
                    </div>

                    <div className="col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">检测方法:</p>
                        <p className="text-xl font-semibold">
                            {method === "zscore" && "Z-Score"}
                            {method === "iqr" && "IQR (四分位距)"}
                            {method === "percentile" && "百分位数"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            阈值: {threshold}
                        </p>
                    </div>
                </div>

                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center mb-2">
                            <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                            <h4 className="text-sm font-medium">方法详情</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {formatMethodDetails().map((detail, index) => (
                                <div key={`detail-${index}`}>
                                    <p className="text-gray-500 dark:text-gray-400">{detail.name}:</p>
                                    <p className="font-medium">{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                            {method === "zscore" && (
                                <p>Z-Score方法基于均值和标准差检测异常值，适用于呈正态分布的数据。超出 <strong>{threshold}</strong> 个标准差的数据点被视为异常值。</p>
                            )}
                            {method === "iqr" && (
                                <p>IQR方法基于四分位数范围检测异常值，不受极端值影响，适用于偏斜分布数据。小于 Q1-<strong>{threshold}×IQR</strong> 或大于 Q3+<strong>{threshold}×IQR</strong> 的数据点被视为异常值。</p>
                            )}
                            {method === "percentile" && (
                                <p>百分位数方法使用百分位数确定异常值边界，适合需要去除特定比例极端值的场景。低于第 <strong>{threshold}</strong> 百分位或高于第 <strong>{100 - threshold}</strong> 百分位的数据点被视为异常值。</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-2">
                        <TabsList>
                            <TabsTrigger value="chart">可视化图表</TabsTrigger>
                            <TabsTrigger value="table">异常值数据</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="chart">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-[400px] w-full" />
                            </div>
                        ) : (
                            <div>
                                {renderScatterPlot()}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="table">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-[400px] w-full" />
                            </div>
                        ) : (
                            renderTable()
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 