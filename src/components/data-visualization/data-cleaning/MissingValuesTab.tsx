"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn/radio-group";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/shadcn/select";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Switch } from "@/components/ui/shadcn/switch";
import { InfoIcon, CheckIcon } from "lucide-react";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { MissingValuesTabProps } from "./types";
import { useToast } from "@/utils/hooks/use-toast";

export default function MissingValuesTab({
    columns,
    onSettingsChange,
    rawData,
    onComplete,
    onProgress,
    onProcessingStart,
    onProcessingEnd,
    onError,
    file
}: MissingValuesTabProps) {
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [missingValueOption, setMissingValueOption] = useState<string>("drop");
    const [fillValue, setFillValue] = useState<string>("");
    const [fillMethod, setFillMethod] = useState<string>("mean");
    const [dropThreshold, setDropThreshold] = useState<number>(50);
    const [selectedThresholdType, setSelectedThresholdType] = useState<string>("percent");
    const [missingStatistics, setMissingStatistics] = useState<{
        [column: string]: {
            count: number;
            percentage: number;
        }
    }>({});
    const [cleaningComplete, setCleaningComplete] = useState<boolean>(false);
    const { toast } = useToast();

    // Get store data and functions 
    const {
        rawFileData: storeRawFileData,
        cleanedData,
        updateCleanedData
    } = useDataVisualizationStore();

    // Get the raw file data from the store if not provided via props
    const effectiveRawData = rawData || storeRawFileData;

    // Calculate missing values statistics for each column
    const columnStats = useMemo(() => {
        if (!effectiveRawData) return {};

        const stats: Record<string, { count: number; percentage: number }> = {};

        effectiveRawData.headers.forEach((column, colIdx) => {
            let missingCount = 0;

            effectiveRawData.rows.forEach((row) => {
                const value = row[colIdx];

                const isMissing =
                    value === null ||
                    value === undefined ||
                    (typeof value === "string" && value.trim() === "") ||
                    (typeof value === "string" &&
                        ["na", "n/a", "null"].includes(value.trim().toLowerCase()));

                if (isMissing) {
                    missingCount++;
                }
            });

            const totalRows = effectiveRawData.rows.length;
            stats[column] = {
                count: missingCount,
                percentage: totalRows > 0 ? (missingCount / totalRows) * 100 : 0,
            };
        });

        return stats;
    }, [effectiveRawData]);

    // Notify parent component of settings changes
    useEffect(() => {
        if (selectedColumns.length === 0) return;

        const settings: { [key: string]: { strategy: string; value?: string | number } } = {};

        selectedColumns.forEach(column => {
            if (missingValueOption === "drop") {
                settings[column] = {
                    strategy: "drop",
                    value: selectedThresholdType === "percent" ? dropThreshold : dropThreshold
                };
            } else if (missingValueOption === "fill-value") {
                settings[column] = {
                    strategy: "fill-value",
                    value: fillValue
                };
            } else if (missingValueOption === "fill-method") {
                settings[column] = {
                    strategy: "fill-method",
                    value: fillMethod
                };
            }
        });

        onSettingsChange(settings);
        setCleaningComplete(false);
    }, [selectedColumns, missingValueOption, fillValue, fillMethod, dropThreshold, selectedThresholdType, onSettingsChange]);

    // Handle missing values processing
    const handleProcessMissingValues = async () => {
        if (!file || !effectiveRawData || selectedColumns.length === 0) {
            toast({
                title: "错误",
                description: "请先选择要处理的列",
                variant: "destructive"
            });
            return;
        }

        // Get the current settings
        const settings: { [key: string]: { strategy: string; value?: string | number } } = {};
        selectedColumns.forEach(column => {
            if (missingValueOption === "drop") {
                settings[column] = {
                    strategy: "drop",
                    value: selectedThresholdType === "percent" ? dropThreshold : dropThreshold
                };
            } else if (missingValueOption === "fill-value") {
                settings[column] = {
                    strategy: "fill-value",
                    value: fillValue
                };
            } else if (missingValueOption === "fill-method") {
                settings[column] = {
                    strategy: "fill-method",
                    value: fillMethod
                };
            }
        });

        if (Object.keys(settings).length === 0) return;

        onProcessingStart();

        try {
            const totalSteps = Object.keys(settings).length;
            let currentStep = 0;

            // Start from already-cleaned data if存在
            let currentData = cleanedData && cleanedData.headers.length > 0
                ? { headers: [...cleanedData.headers], rows: JSON.parse(JSON.stringify(cleanedData.rows)) }
                : { headers: [...effectiveRawData.headers], rows: JSON.parse(JSON.stringify(effectiveRawData.rows)) };

            for (const column of Object.keys(settings)) {
                currentStep += 1;
                onProgress(Math.round((currentStep / totalSteps) * 100));

                const columnSetting = settings[column];
                const colIndex = currentData.headers.indexOf(column);
                if (colIndex === -1) continue;

                // Helper to decide if cell is missing
                const isCellMissing = (cell: any): boolean => {
                    return (
                        cell === null ||
                        cell === undefined ||
                        cell === "" ||
                        (typeof cell === "string" && cell.trim() === "") ||
                        (typeof cell === "string" && ["na", "n/a", "null", "-"].includes(cell.trim().toLowerCase()))
                    );
                };

                if (columnSetting.strategy === "drop") {
                    // 直接删除包含缺失值的行
                    currentData.rows = currentData.rows.filter((row: any[]) => !isCellMissing(row[colIndex]));
                } else if (columnSetting.strategy === "fill-value") {
                    // 用指定的值填充
                    const rawVal = columnSetting.value ?? "";
                    const numVal = Number(rawVal);
                    const fillVal = isNaN(numVal) ? rawVal : numVal;

                    currentData.rows = currentData.rows.map((row: any[]) => {
                        const newRow = [...row];
                        if (isCellMissing(row[colIndex])) {
                            newRow[colIndex] = fillVal;
                        }
                        return newRow;
                    });
                } else if (columnSetting.strategy === "fill-method") {
                    // 统计列值用于计算替换值
                    const numericVals: number[] = [];
                    const stringVals: string[] = [];

                    currentData.rows.forEach((row: any[]) => {
                        const cell = row[colIndex];
                        if (!isCellMissing(cell)) {
                            const num = Number(cell);
                            if (!isNaN(num)) numericVals.push(num);
                            else stringVals.push(String(cell));
                        }
                    });

                    let replacement: any = null;
                    if (numericVals.length > 0) {
                        switch (columnSetting.value) {
                            case "mean":
                                replacement = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
                                break;
                            case "median": {
                                const sorted = [...numericVals].sort((a, b) => a - b);
                                const mid = Math.floor(sorted.length / 2);
                                replacement = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                                break;
                            }
                            case "min":
                                replacement = Math.min(...numericVals);
                                break;
                            case "max":
                                replacement = Math.max(...numericVals);
                                break;
                            default:
                                break;
                        }
                    }

                    if (replacement === null) {
                        // 计算众数（mode），适用于字符串列或数值列默认
                        const allValues = [...numericVals.map(String), ...stringVals];
                        const freq: Record<string, number> = {};

                        for (const val of allValues) {
                            freq[val] = (freq[val] || 0) + 1;
                        }

                        const modeEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
                        replacement = modeEntry ? modeEntry[0] : "";

                        // 如果众数是数字字符串，转回数字
                        const numVal = Number(replacement);
                        if (!isNaN(numVal)) {
                            replacement = numVal;
                        }
                    }

                    currentData.rows = currentData.rows.map((row: any[]) => {
                        const newRow = [...row];
                        if (isCellMissing(row[colIndex])) {
                            newRow[colIndex] = replacement;
                        }
                        return newRow;
                    });
                }
            }

            // 更新全局 cleanedData
            updateCleanedData(currentData);

            toast({
                title: "缺失值处理完成",
                description: "已成功完成所有缺失值处理操作",
            });

            setCleaningComplete(true);
            onComplete();
            onProgress(100);
        } catch (error) {
            console.error("Error processing missing values:", error);
            onError(`处理缺失值时出错: ${error}`);
        } finally {
            onProcessingEnd();
        }
    };

    // 如果存在用户界面但没有rawData，显示提示信息
    if (!effectiveRawData) {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    缺失值处理选项
                </h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                    <p className="text-amber-700 dark:text-amber-300">
                        请先预览文件数据，确保原始数据已加载。可能需要切换到文件预览选项卡，然后再回到此页面。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                缺失值处理选项
            </h4>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="column-select" className="mb-1 block">
                        选择要处理的列:
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {columns.map((column) => (
                            <div key={column} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`col-${column}`}
                                    checked={selectedColumns.includes(column)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedColumns([...selectedColumns, column]);
                                        } else {
                                            setSelectedColumns(selectedColumns.filter(c => c !== column));
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={`col-${column}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {column}
                                    {columnStats[column] && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({columnStats[column].count} 缺失, {columnStats[column].percentage.toFixed(1)}%)
                                        </span>
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="mb-1 block">处理方式:</Label>
                    <RadioGroup
                        value={missingValueOption}
                        onValueChange={setMissingValueOption}
                        className="space-y-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="drop" id="drop-rows" />
                            <Label htmlFor="drop-rows" className="font-normal cursor-pointer">
                                删除包含缺失值的行
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fill-value" id="fill-value" />
                            <Label htmlFor="fill-value" className="font-normal cursor-pointer">
                                用特定值填充
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fill-method" id="fill-method" />
                            <Label htmlFor="fill-method" className="font-normal cursor-pointer">
                                用统计值填充
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {missingValueOption === "drop" && (
                    <div className="space-y-3 pl-6">
                        <Label className="flex items-center justify-between mb-1">
                            <span>仅当缺失值比例低于阈值时删除:</span>
                            <span className="text-xs font-normal text-gray-500">
                                当前值: {dropThreshold}{selectedThresholdType === "percent" ? "%" : "行"}
                            </span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                value={dropThreshold}
                                onChange={(e) => setDropThreshold(Number(e.target.value))}
                                className="w-24"
                                min={0}
                                max={selectedThresholdType === "percent" ? 100 : effectiveRawData.rows.length}
                            />
                            <Select
                                value={selectedThresholdType}
                                onValueChange={setSelectedThresholdType}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="选择类型" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent">百分比</SelectItem>
                                    <SelectItem value="count">绝对数量</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            如果缺失值超过此阈值，则不执行删除操作，避免数据过度损失
                        </p>
                    </div>
                )}

                {missingValueOption === "fill-value" && (
                    <div className="space-y-3 pl-6">
                        <Label htmlFor="fill-value-input" className="mb-1 block">
                            填充值:
                        </Label>
                        <Input
                            id="fill-value-input"
                            placeholder="输入用于填充的值"
                            value={fillValue}
                            onChange={(e) => setFillValue(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            数值列将转换为数字，非数值列将保留为字符串
                        </p>
                    </div>
                )}

                {missingValueOption === "fill-method" && (
                    <div className="space-y-3 pl-6">
                        <Label htmlFor="fill-method-select" className="mb-1 block">
                            填充方法:
                        </Label>
                        <Select value={fillMethod} onValueChange={setFillMethod}>
                            <SelectTrigger id="fill-method-select">
                                <SelectValue placeholder="选择填充方法" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mean">平均值（数值列）</SelectItem>
                                <SelectItem value="median">中位数（数值列）</SelectItem>
                                <SelectItem value="mode">众数（所有列类型）</SelectItem>
                                <SelectItem value="min">最小值（数值列）</SelectItem>
                                <SelectItem value="max">最大值（数值列）</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                            对于非数值列，仅众数填充有效；其他方法将默认使用众数
                        </p>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500 bg-slate-100 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700 mt-4">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">缺失值处理说明：</p>
                <p className="mb-1">缺失值是数据集中的空白项或未记录的值，可能导致分析错误或偏差。</p>
                <p>处理策略应根据分析目标和数据特性选择，删除缺失值适用于缺失较少的情况，而填充则可保留更多数据量。</p>
            </div>

            <div className="flex justify-end mt-6">
                <Button
                    variant="default"
                    onClick={handleProcessMissingValues}
                    disabled={selectedColumns.length === 0}
                >
                    {cleaningComplete ? (
                        <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            完成
                        </>
                    ) : (
                        "处理数据"
                    )}
                </Button>
            </div>
        </div>
    );
} 