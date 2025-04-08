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
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

type CellValue = string | number;

interface ChartDataItem {
    name: string;
    value: number;
}

interface VisualizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedColumn: string;
    columnData: CellValue[];
    file: File | null;
}

export default function VisualizationModal({
    isOpen,
    onClose,
    selectedColumn,
    columnData,
    file,
}: VisualizationModalProps) {
    const [chartType, setChartType] = useState<string>("pie");
    const [processedData, setProcessedData] = useState<ChartDataItem[]>([]);
    const [uniqueValues, setUniqueValues] = useState<number>(0);
    const [isValidForVisualization, setIsValidForVisualization] = useState<boolean>(true);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);
    const [frequencies, setFrequencies] = useState<{ [key: string]: number }>({});
    const COLORS = ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9013FE", "#B8E986"];

    useEffect(() => {
        if (columnData && columnData.length > 0) {
            // Count frequency of each value
            const freqMap: { [key: string]: number } = {};

            for (const value of columnData) {
                const key = String(value).trim();
                // Skip empty values
                if (!key) continue;
                freqMap[key] = (freqMap[key] || 0) + 1;
            }

            setFrequencies(freqMap);

            // Count unique values
            const uniqueCount = Object.keys(freqMap).length;
            setUniqueValues(uniqueCount);

            // Check if data is empty (all values are empty strings or null)
            const nonEmptyCount = Object.keys(freqMap).filter(key => key.trim() !== '').length;
            setIsEmpty(nonEmptyCount === 0);

            // Check if data is valid for visualization
            // If every value is unique or almost unique, it's not good for visualization
            const isValid = uniqueCount < columnData.length * 0.9 && !isEmpty;
            setIsValidForVisualization(isValid);

            // Process data for charts
            const chartData = Object.entries(freqMap).map(([name, value]) => ({
                name,
                value,
            }));

            // Sort by frequency for better visualization
            chartData.sort((a, b) => b.value - a.value);

            // Limit to top 10 values for better visualization
            setProcessedData(chartData.slice(0, 10));
        } else {
            setIsEmpty(true);
            setIsValidForVisualization(false);
        }
    }, [columnData, isEmpty]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>"{selectedColumn}" 列数据可视化</DialogTitle>
                    <DialogDescription>
                        选择适合的图表类型进行数据可视化分析
                    </DialogDescription>
                </DialogHeader>

                {isEmpty ? (
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
                            <button
                                type="button"
                                onClick={() => setChartType("pie")}
                                className={`px-3 py-1 rounded ${chartType === "pie"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                饼图
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartType("bar")}
                                className={`px-3 py-1 rounded ${chartType === "bar"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                柱状图
                            </button>
                        </div>

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
                                            {processedData.map((entry) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={COLORS[processedData.indexOf(entry) % COLORS.length]}
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
                                            fill="#8884d8"
                                        />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>

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
                    </>
                )}

                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                        关闭
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 