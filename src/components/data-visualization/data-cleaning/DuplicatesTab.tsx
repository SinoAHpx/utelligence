import React, { useState, useEffect } from "react";
import { DuplicatesTabProps } from "./types";
import { Loader2, InfoIcon, Eye, CheckIcon, CircleIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DuplicatesVisualization from "../duplicates-visualization";

export default function DuplicatesTab({
    file,
    columns,
    onSettingsChange,
    rawData
}: DuplicatesTabProps) {
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    // 本地状态
    const [duplicateOption, setDuplicateOption] = useState<string>("remove-duplicates");
    const [keepStrategy, setKeepStrategy] = useState<string>("first");
    const [columnsSelection, setColumnsSelection] = useState<string[]>([]);
    const [duplicateStats, setDuplicateStats] = useState<{
        totalRows: number;
        uniqueRows: number;
        duplicateRows: number;
        duplicateGroupsCount: number;
        duplicateCount: number;
        hasRun: boolean;
    }>({
        totalRows: 0,
        uniqueRows: 0,
        duplicateRows: 0,
        duplicateGroupsCount: 0,
        duplicateCount: 0,
        hasRun: false
    });

    // 初始化选择，默认选择所有列
    useEffect(() => {
        if (columns.length > 0 && columnsSelection.length === 0) {
            setColumnsSelection([...columns]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns]);

    // 当设置改变时，通知父组件
    useEffect(() => {
        onSettingsChange({
            columnsToCheck: columnsSelection,
            strategy: keepStrategy,
        });
    }, [columnsSelection, keepStrategy, onSettingsChange]);

    const analyzeDuplicates = async () => {
        // 确保rawData存在并有效
        if (!rawData || !rawData.rows || !rawData.headers) {
            toast({
                title: "错误",
                description: "无法分析数据，原始文件数据不存在或无效",
                variant: "destructive",
            });
            return;
        }

        // 确保已选择列
        if (columnsSelection.length === 0) {
            toast({
                title: "错误",
                description: "无法分析数据，请确保至少选择了一列",
                variant: "destructive",
            });
            return;
        }

        setIsAnalyzing(true);

        try {
            // 准备要发送的数据
            const dataForAnalysis = rawData.rows.map((row, idx) => {
                const rowData: Record<string, any> = {};
                rawData.headers.forEach((header, i) => {
                    rowData[header] = row[i];
                });
                return rowData;
            });

            // 使用POST请求
            const response = await fetch(`/api/data/duplicates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: dataForAnalysis,
                    columns: columnsSelection,
                    analyzeOnly: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "分析重复数据时出错");
            }

            const result = await response.json();

            setDuplicateStats({
                ...result.statistics,
                hasRun: true
            });

        } catch (error) {
            console.error("分析重复数据时出错:", error);
            toast({
                title: "分析错误",
                description: error instanceof Error ? error.message : "分析重复数据时出错",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 如果存在用户界面但没有rawData，显示提示信息
    if (!rawData) {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    重复数据处理选项
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
            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        重复数据处理选项
                    </h4>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">选择用于判断重复的列:</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setColumnsSelection([...columns])}
                                    className="h-8 px-2 text-xs text-gray-500 hover:text-primary"
                                >
                                    <CheckIcon className="h-3.5 w-3.5 mr-1" />
                                    全选
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setColumnsSelection([])}
                                    className="h-8 px-2 text-xs text-gray-500 hover:text-destructive"
                                >
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    清空
                                </Button>

                                {columnsSelection.length > 0 && (
                                    <Badge variant="secondary" className="h-6 px-2 ml-2">
                                        {columnsSelection.length}/{columns.length}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3 max-h-[200px] overflow-y-auto p-3 border rounded-md">
                            {columns.map((column) => {
                                const isSelected = columnsSelection.includes(column);
                                return (
                                    <Badge
                                        key={column}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "px-3 py-1 cursor-pointer hover:bg-opacity-80 transition-colors",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground"
                                        )}
                                        onClick={() => {
                                            if (isSelected) {
                                                setColumnsSelection(
                                                    columnsSelection.filter((c) => c !== column)
                                                );
                                            } else {
                                                setColumnsSelection([...columnsSelection, column]);
                                            }
                                        }}
                                    >
                                        {column}
                                        {isSelected ? (
                                            <X className="ml-1 h-3 w-3" />
                                        ) : (
                                            <CheckIcon className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-50" />
                                        )}
                                    </Badge>
                                );
                            })}
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            点击标签选择或取消选择列。根据选定列的值组合来检测重复记录。
                        </p>
                    </div>

                    <div className="space-y-3 mt-4">
                        <Label className="mb-1 block">重复数据处理方式:</Label>
                        <RadioGroup
                            value={duplicateOption}
                            onValueChange={setDuplicateOption}
                            className="space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="remove-duplicates" id="remove-duplicates" />
                                <Label htmlFor="remove-duplicates" className="font-normal cursor-pointer">
                                    移除重复行
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {duplicateOption === "remove-duplicates" && (
                        <div className="space-y-3 pl-6 mt-2">
                            <Label className="mb-1 block">保留策略:</Label>
                            <RadioGroup
                                value={keepStrategy}
                                onValueChange={setKeepStrategy}
                                className="space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="first" id="keep-first" />
                                    <Label htmlFor="keep-first" className="font-normal cursor-pointer">
                                        保留第一次出现的行
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="last" id="keep-last" />
                                    <Label htmlFor="keep-last" className="font-normal cursor-pointer">
                                        保留最后一次出现的行
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="min-nulls" id="keep-min-nulls" />
                                    <Label htmlFor="keep-min-nulls" className="font-normal cursor-pointer">
                                        保留缺失值最少的行
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 mt-4">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">重复数据说明：</p>
                        <p className="mb-1">重复数据是指在选定列中具有完全相同值的多行数据。</p>
                        <p>移除重复数据可以减小数据集大小并防止分析偏差，但应谨慎选择保留策略以确保保留最有价值的记录。</p>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={analyzeDuplicates}
                            disabled={isAnalyzing || columnsSelection.length === 0}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    分析中...
                                </>
                            ) : (
                                <>分析重复数据</>
                            )}
                        </Button>
                    </div>

                    {duplicateStats.hasRun && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="text-sm font-medium flex items-center mb-3">
                                <InfoIcon className="w-4 h-4 mr-1 text-blue-500" />
                                重复数据分析结果
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">重复记录组数</span>
                                    <p className="text-xl font-semibold">{duplicateStats.duplicateGroupsCount}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">重复记录总数</span>
                                    <p className="text-xl font-semibold">
                                        {duplicateStats.duplicateCount}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {Math.round(duplicateStats.duplicateCount / (rawData?.rows.length || 1) * 100)}%
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 