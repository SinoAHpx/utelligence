import React, { useState, useEffect, useMemo } from "react";
import { OutliersTabProps } from "./types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, BarChart3Icon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";

export default function OutliersTab({
    columns,
    onSettingsChange,
    rawData
}: OutliersTabProps) {
    // State for column selection and outlier detection settings
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [detectionMethod, setDetectionMethod] = useState<string>("zscore");
    const [replacementMethod, setReplacementMethod] = useState<string>("remove");
    const [threshold, setThreshold] = useState<number>(3);
    const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5);
    const [outliersStatistics, setOutliersStatistics] = useState<{
        [column: string]: {
            outlierCount: number;
            percentage: number;
            min: number;
            max: number;
            mean: number;
            median: number;
            q1: number;
            q3: number;
            lowerBound: number;
            upperBound: number;
        } | null
    }>({});
    const [analyzingColumn, setAnalyzingColumn] = useState<string | null>(null);

    // Get the raw file data from the store if not provided via props
    const storeRawFileData = useDataVisualizationStore((state) => state.rawFileData);
    const effectiveRawData = rawData || storeRawFileData;

    // Calculate potential outliers for each numeric column
    const columnOutlierStats = useMemo(() => {
        if (!effectiveRawData) return {};

        const stats: Record<string, {
            count: number,
            percentage: number,
            min: number,
            max: number,
            mean: number,
            std: number,
            isNumeric: boolean
        }> = {};

        effectiveRawData.headers.forEach(column => {
            // Check if column has numeric values
            const numericValues: number[] = [];
            let isNumeric = true;

            effectiveRawData.rows.forEach(row => {
                const value = row[column];
                if (value === null || value === undefined || value === "") return;

                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    numericValues.push(numValue);
                } else {
                    isNumeric = false;
                }
            });

            if (!isNumeric || numericValues.length === 0) {
                stats[column] = {
                    count: 0,
                    percentage: 0,
                    min: 0,
                    max: 0,
                    mean: 0,
                    std: 0,
                    isNumeric: false
                };
                return;
            }

            // Calculate basic statistics
            const sum = numericValues.reduce((acc, val) => acc + val, 0);
            const mean = sum / numericValues.length;
            const squaredDiffs = numericValues.map(val => Math.pow(val - mean, 2));
            const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length;
            const std = Math.sqrt(variance);

            // Detect outliers using Z-score
            let outlierCount = 0;
            numericValues.forEach(value => {
                const zScore = Math.abs((value - mean) / std);
                if (zScore > threshold) {
                    outlierCount++;
                }
            });

            stats[column] = {
                count: outlierCount,
                percentage: (outlierCount / numericValues.length) * 100,
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                mean,
                std,
                isNumeric: true
            };
        });

        return stats;
    }, [effectiveRawData, threshold]);

    // Notify parent component of settings changes
    useEffect(() => {
        if (selectedColumns.length === 0) return;

        const settings: { [key: string]: { method: string; threshold: number; replacement: string } } = {};

        selectedColumns.forEach(column => {
            if (columnOutlierStats[column]?.isNumeric) {
                settings[column] = {
                    method: detectionMethod,
                    threshold: detectionMethod === "zscore" ? threshold : iqrMultiplier,
                    replacement: replacementMethod
                };
            }
        });

        onSettingsChange(settings);
    }, [selectedColumns, detectionMethod, replacementMethod, threshold, iqrMultiplier, columnOutlierStats]);

    // 如果存在用户界面但没有rawData，显示提示信息
    if (!effectiveRawData) {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    异常值检测与处理
                </h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                    <p className="text-amber-700 dark:text-amber-300">
                        请先预览文件数据，确保原始数据已加载。可能需要切换到文件预览选项卡，然后再回到此页面。
                    </p>
                </div>
            </div>
        );
    }

    const numericColumns = columns.filter(column => columnOutlierStats[column]?.isNumeric);

    return (
        <div className="space-y-6">
            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            异常值检测与处理
                        </h4>

                        {numericColumns.length === 0 && (
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                                未检测到数值列
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div>
                            <Label htmlFor="column-select" className="mb-1 block">
                                选择要分析的列:
                            </Label>
                            <div className="flex gap-2">
                                <Select value={selectedColumns} onValueChange={setSelectedColumns}>
                                    <SelectTrigger id="column-select" className="w-full">
                                        <SelectValue placeholder="选择列" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map((column) => (
                                            <SelectItem
                                                key={column}
                                                value={column}
                                                disabled={!columnOutlierStats[column]?.isNumeric}
                                            >
                                                {column}
                                                {!columnOutlierStats[column]?.isNumeric &&
                                                    <span className="ml-2 text-gray-400">(非数值)</span>
                                                }
                                                {outliersStatistics[column] && outliersStatistics[column]?.outlierCount > 0 && (
                                                    <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                                        ({outliersStatistics[column]?.outlierCount} 异常值,
                                                        {outliersStatistics[column]?.percentage.toFixed(1)}%)
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setAnalyzingColumn(selectedColumns[0]);
                                    }}
                                    disabled={selectedColumns.length === 0 || analyzingColumn === selectedColumns[0]}
                                >
                                    {analyzingColumn === selectedColumns[0] ? "分析中..." : "分析"}
                                </Button>
                            </div>

                            {selectedColumns.length > 0 && outliersStatistics[selectedColumns[0]] && (
                                <div className="mt-3 text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                    <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                                        <BarChart3Icon className="h-3.5 w-3.5 mr-1" />
                                        <span className="font-medium">"{selectedColumns[0]}" 列的统计信息</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div>最小值: {outliersStatistics[selectedColumns[0]]?.min.toFixed(2)}</div>
                                        <div>最大值: {outliersStatistics[selectedColumns[0]]?.max.toFixed(2)}</div>
                                        <div>平均值: {outliersStatistics[selectedColumns[0]]?.mean.toFixed(2)}</div>
                                        <div>中位数: {outliersStatistics[selectedColumns[0]]?.median.toFixed(2)}</div>
                                        <div>Q1 (25%): {outliersStatistics[selectedColumns[0]]?.q1.toFixed(2)}</div>
                                        <div>Q3 (75%): {outliersStatistics[selectedColumns[0]]?.q3.toFixed(2)}</div>
                                        <div className="col-span-2 mt-1 font-medium text-amber-600 dark:text-amber-400">
                                            检测到 {outliersStatistics[selectedColumns[0]]?.outlierCount} 个异常值
                                            ({outliersStatistics[selectedColumns[0]]?.percentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedColumns.length > 0 && outliersStatistics[selectedColumns[0]] === null && (
                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                    <span className="flex items-center">
                                        <InfoIcon className="h-3 w-3 mr-1" />
                                        无法分析此列。请确保选择包含数值数据的列。
                                    </span>
                                </div>
                            )}
                        </div>

                        {numericColumns.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="mb-2 block font-medium">异常值检测方法:</Label>
                                        <RadioGroup
                                            value={detectionMethod}
                                            onValueChange={setDetectionMethod}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="zscore" id="zscore" />
                                                <Label htmlFor="zscore" className="font-normal cursor-pointer">
                                                    Z-Score法
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="iqr" id="iqr" />
                                                <Label htmlFor="iqr" className="font-normal cursor-pointer">
                                                    IQR法 (四分位距)
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {detectionMethod === "zscore" && (
                                        <div className="space-y-2 pl-6">
                                            <Label className="flex items-center justify-between">
                                                <span>Z-Score阈值:</span>
                                                <span className="text-xs font-normal text-gray-500">
                                                    当前值: {threshold.toFixed(1)}
                                                </span>
                                            </Label>
                                            <Slider
                                                value={[threshold]}
                                                min={1}
                                                max={5}
                                                step={0.1}
                                                onValueChange={(values) => setThreshold(values[0])}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Z-Score大于此阈值的数据点将被视为异常值。
                                                典型值为3.0（标准差的3倍）。较低的值会更严格。
                                            </p>
                                        </div>
                                    )}

                                    {detectionMethod === "iqr" && (
                                        <div className="space-y-2 pl-6">
                                            <Label className="flex items-center justify-between">
                                                <span>IQR乘数:</span>
                                                <span className="text-xs font-normal text-gray-500">
                                                    当前值: {iqrMultiplier.toFixed(1)}
                                                </span>
                                            </Label>
                                            <Slider
                                                value={[iqrMultiplier]}
                                                min={0.5}
                                                max={3}
                                                step={0.1}
                                                onValueChange={(values) => setIqrMultiplier(values[0])}
                                            />
                                            <p className="text-xs text-gray-500">
                                                超出Q1-IQR*乘数或Q3+IQR*乘数范围的数据点将被视为异常值。
                                                典型值为1.5。较高的值会更宽松。
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="mb-2 block font-medium">异常值处理方法:</Label>
                                        <RadioGroup
                                            value={replacementMethod}
                                            onValueChange={setReplacementMethod}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="remove" id="remove" />
                                                <Label htmlFor="remove" className="font-normal cursor-pointer">
                                                    删除包含异常值的行
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="cap" id="cap" />
                                                <Label htmlFor="cap" className="font-normal cursor-pointer">
                                                    截断异常值（限制在边界范围内）
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="mean" id="mean" />
                                                <Label htmlFor="mean" className="font-normal cursor-pointer">
                                                    替换为平均值
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="median" id="median" />
                                                <Label htmlFor="median" className="font-normal cursor-pointer">
                                                    替换为中位数
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 bg-slate-100 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700 mt-6">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">异常值处理说明：</p>
                        <p className="mb-1">异常值是指显著偏离数据集主体分布的数据点，可能是由测量错误、数据输入错误或者真实的极端情况导致。</p>
                        <p>Z-Score法基于标准差检测异常值，适用于近似正态分布的数据；IQR法基于四分位数间距，对分布无特殊要求，更稳健。</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 