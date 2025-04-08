"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getChartColor } from "@/constants/chart-colors";
import { ChartDataItem as ChartData } from "@/types/chart-types";
import { CellValue, analyzeColumnData } from "@/utils/data-processing";

/**
 * Chart data item structure for visualization
 */
interface ChartDataItem {
    name: string;
    value: number;
}

/**
 * Props for the visualization modal component
 */
interface VisualizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedColumn: string;
    columnData: CellValue[];
    file: File | null;
}

/**
 * Visualization modal component
 * Displays column data in different chart types
 */
export default function VisualizationModal({
    isOpen,
    onClose,
    selectedColumn,
    columnData,
    file,
}: VisualizationModalProps) {
    // State
    const [chartType, setChartType] = useState<string>("pie");
    const [processedData, setProcessedData] = useState<ChartDataItem[]>([]);
    const [uniqueValues, setUniqueValues] = useState<number>(0);
    const [isValidForVisualization, setIsValidForVisualization] = useState<boolean>(true);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);
    const [frequencies, setFrequencies] = useState<{ [key: string]: number }>({});
    const [error, setError] = useState<string | null>(null);

    /**
     * Process column data for visualization
     */
    useEffect(() => {
        if (!columnData || columnData.length === 0) {
            setIsEmpty(true);
            setIsValidForVisualization(false);
            return;
        }

        try {
            // Use the shared analyzeColumnData utility
            const analysis = analyzeColumnData(columnData);

            setFrequencies(analysis.frequencies);
            setUniqueValues(analysis.uniqueValues);
            setIsEmpty(analysis.isEmpty);
            setIsValidForVisualization(analysis.isValidForVisualization);
            setProcessedData(analysis.processedData);
            setError(null);
        } catch (err) {
            console.error("Error analyzing column data:", err);
            setError("数据分析错误，请重试或选择其他列");
        }
    }, [columnData]);

    /**
     * Renders the appropriate chart based on type
     */
    const renderChart = () => {
        // Import dynamic components to avoid bundle bloat
        const { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = require('recharts');

        return (
            <div className="h-[350px] my-4">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                        <PieChart>
                            <Pie
                                data={processedData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {processedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.name}`}
                                        fill={getChartColor(index)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    ) : (
                        <BarChart
                            data={processedData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={70}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="value"
                                name="频率"
                                fill={getChartColor(0)}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    /**
     * Renders data analysis summary
     */
    const renderDataAnalysis = () => (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">数据分析</h4>
            <ul className="text-sm space-y-1">
                <li>共有 <span className="font-medium">{columnData.length}</span> 条数据</li>
                <li>包含 <span className="font-medium">{uniqueValues}</span> 个不同的值</li>
                {processedData.slice(0, 3).map((item) => (
                    <li key={`stat-${item.name}`}>
                        最常出现的值: <span className="font-medium">{item.name}</span>
                        (出现 <span className="font-medium">{item.value}</span> 次)
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>"{selectedColumn}" 列数据可视化</DialogTitle>
                    <DialogDescription>
                        选择适合的图表类型进行数据可视化分析
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <div className="py-6 text-center">
                        <p className="text-red-500 font-medium mb-2">处理数据时出错</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                    </div>
                ) : isEmpty ? (
                    <div className="py-6 text-center">
                        <p className="text-amber-500 font-medium mb-2">此列数据为空</p>
                        <p className="text-gray-500 text-sm">
                            该列没有可用的有效数据进行可视化。请选择其他列。
                        </p>
                    </div>
                ) : !isValidForVisualization ? (
                    <div className="py-6 text-center">
                        <p className="text-amber-500 font-medium mb-2">此列数据不适合进行可视化</p>
                        <p className="text-gray-500 text-sm">
                            该列包含 {uniqueValues} 个不同的值，几乎每个值都是唯一的。
                            <br />
                            这种数据不适合用图表展示，建议选择其他列或进行数据处理后再尝试。
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center gap-4 mb-4">
                            <Button
                                variant={chartType === "pie" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setChartType("pie")}
                            >
                                饼图
                            </Button>
                            <Button
                                variant={chartType === "bar" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setChartType("bar")}
                            >
                                柱状图
                            </Button>
                        </div>

                        {renderChart()}
                        {renderDataAnalysis()}
                    </>
                )}

                <DialogFooter>
                    <Button onClick={onClose}>关闭</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 