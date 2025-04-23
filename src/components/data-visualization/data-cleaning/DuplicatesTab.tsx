import React from "react";
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

export function DuplicatesTab({
    file,
    selectedColumns,
    availableColumns,
    rawFileData,
    duplicateOption,
    setDuplicateOption,
    keepStrategy,
    setKeepStrategy,
    duplicateColumnsSelection,
    setDuplicateColumnsSelection,
    duplicateStats,
    setDuplicateStats,
    duplicateGroups,
    setDuplicateGroups,
    showDuplicatesVisualization,
    setShowDuplicatesVisualization
}: DuplicatesTabProps) {
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = React.useState<boolean>(false);

    // Initialize with selected columns if empty
    React.useEffect(() => {
        if (selectedColumns.length > 0 && (!duplicateColumnsSelection || duplicateColumnsSelection.length === 0)) {
            setDuplicateColumnsSelection([...selectedColumns]);
        }
    }, [selectedColumns, duplicateColumnsSelection, setDuplicateColumnsSelection]);

    const analyzeDuplicates = async () => {

        // 确保rawFileData存在并有效
        if (!rawFileData || !rawFileData.rows || !rawFileData.headers) {
            toast({
                title: "错误",
                description: "无法分析数据，原始文件数据不存在或无效",
                variant: "destructive",
            });
            return;
        }

        // Make sure duplicateColumnsSelection is an array and not undefined or null
        const columnsToAnalyze = Array.isArray(duplicateColumnsSelection) ? duplicateColumnsSelection : [];

        if (columnsToAnalyze.length === 0) {
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
            const dataForAnalysis = rawFileData.rows.map((row, idx) => {
                const rowData: Record<string, any> = { _index: idx };
                rawFileData.headers.forEach((header, i) => {
                    rowData[header] = row[i];
                });
                return rowData;
            });

            // 使用POST请求而不是GET，避免URL过长
            const response = await fetch(`/api/data/duplicates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: dataForAnalysis,
                    columns: columnsToAnalyze, // Use the validated columns array
                    analyzeOnly: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "分析重复数据时出错");
            }

            const result = await response.json();

            setDuplicateGroups(result.duplicateGroups);
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

    // 如果存在用户界面但没有rawFileData，显示提示信息
    if (!rawFileData) {
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
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                重复数据处理选项
            </h4>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">选择用于判断重复的列:</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDuplicateColumnsSelection([...availableColumns])}
                            className="h-8 px-2 text-xs text-gray-500 hover:text-primary"
                        >
                            <CheckIcon className="h-3.5 w-3.5 mr-1" />
                            全选
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDuplicateColumnsSelection([])}
                            className="h-8 px-2 text-xs text-gray-500 hover:text-destructive"
                        >
                            <CircleIcon className="h-3.5 w-3.5 mr-1" />
                            清空
                        </Button>

                        {duplicateColumnsSelection && duplicateColumnsSelection.length > 0 && (
                            <Badge variant="secondary" className="h-6 px-2 ml-2">
                                {duplicateColumnsSelection.length}/{availableColumns.length}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3 max-h-[200px] overflow-y-auto p-3 border rounded-md">
                    {availableColumns.map((column) => {
                        const isSelected = duplicateColumnsSelection && duplicateColumnsSelection.includes(column);
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
                                        setDuplicateColumnsSelection(
                                            duplicateColumnsSelection.filter((c) => c !== column)
                                        );
                                    } else {
                                        setDuplicateColumnsSelection([...duplicateColumnsSelection || [], column]);
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

            <div className="space-y-3">
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
                <div className="space-y-3 pl-6">
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

            <div className="text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">重复数据说明：</p>
                <p className="mb-1">重复数据是指在选定列中具有完全相同值的多行数据。</p>
                <p>移除重复数据可以减小数据集大小并防止分析偏差，但应谨慎选择保留策略以确保保留最有价值的记录。</p>
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeDuplicates}
                    disabled={isAnalyzing || !duplicateColumnsSelection || duplicateColumnsSelection.length === 0}
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
                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center mb-2">
                            <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                            <h4 className="text-sm font-medium">重复数据分析结果</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">检测依据:</p>
                                <p className="font-medium">
                                    {duplicateColumnsSelection && duplicateColumnsSelection.join(", ")}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">重复行总数:</p>
                                <p className="font-medium">{duplicateStats.duplicateCount}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">重复数据组:</p>
                                <p className="font-medium">{duplicateGroups.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">数据唯一性比例:</p>
                                <p className="font-medium">
                                    {((duplicateStats.uniqueRows / duplicateStats.totalRows) * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                            {duplicateOption === "remove-duplicates" &&
                                `将移除${duplicateStats.duplicateCount - duplicateGroups.length}个重复行，${keepStrategy === "first"
                                    ? "保留首次出现的记录"
                                    : keepStrategy === "last"
                                        ? "保留最后出现的记录"
                                        : "保留每组中缺失值最少的记录"
                                }`}
                        </div>
                        <div className="mt-3 flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDuplicatesVisualization(true)}
                                disabled={duplicateGroups.length === 0}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                查看详情
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showDuplicatesVisualization && duplicateStats.hasRun && duplicateGroups.length > 0 && (
                <DuplicatesVisualization
                    duplicateGroups={duplicateGroups}
                    selectedColumns={duplicateColumnsSelection || []}
                    statistics={duplicateStats}
                    data={[]}
                />
            )}
        </div>
    );
} 