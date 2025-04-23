import React from "react";
import { OutliersTabProps } from "./types";
import { Loader2, InfoIcon, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { mean, standardDeviation } from "@/utils/statistics";
import OutliersVisualization from "../outliers-visualization";

export function OutliersTab({
    file,
    selectedColumn,
    rawFileData,
    outlierOption,
    setOutlierOption,
    detectionMethod,
    setDetectionMethod,
    threshold,
    setThreshold,
    outlierStats,
    setOutlierStats,
    showVisualization,
    setShowVisualization,
    outlierData,
    setOutlierData
}: OutliersTabProps) {
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = React.useState<boolean>(false);

    const analyzeOutliers = async () => {
        if (!rawFileData || !selectedColumn) {
            toast({
                title: "错误",
                description: "无法分析数据，请确保已选择列",
                variant: "destructive",
            });
            return;
        }

        setIsAnalyzing(true);

        try {
            const columnIndex = rawFileData.headers.indexOf(selectedColumn);
            if (columnIndex === -1) {
                throw new Error(`找不到列: ${selectedColumn}`);
            }

            // Extract numeric values
            const values = rawFileData.rows
                .map(row => row[columnIndex])
                .filter(value => value !== null && value !== undefined && String(value).trim() !== "")
                .map(value => typeof value === "number" ? value : Number(value))
                .filter(value => !isNaN(value));

            if (values.length === 0) {
                throw new Error("所选列中没有数值数据");
            }

            let outlierCount = 0;
            let lowerBound = 0;
            let upperBound = 0;

            if (detectionMethod === "zscore") {
                const meanValue = mean(values) || 0;
                const stdDev = standardDeviation(values) || 1;

                lowerBound = meanValue - threshold * stdDev;
                upperBound = meanValue + threshold * stdDev;

                outlierCount = values.filter(value =>
                    Math.abs((value - meanValue) / stdDev) > threshold
                ).length;
            }
            else if (detectionMethod === "iqr") {
                const sortedValues = [...values].sort((a, b) => a - b);
                const q1Index = Math.floor(sortedValues.length * 0.25);
                const q3Index = Math.floor(sortedValues.length * 0.75);

                const q1 = sortedValues[q1Index];
                const q3 = sortedValues[q3Index];
                const iqr = q3 - q1;

                lowerBound = q1 - threshold * iqr;
                upperBound = q3 + threshold * iqr;

                outlierCount = values.filter(value =>
                    value < lowerBound || value > upperBound
                ).length;
            }
            else if (detectionMethod === "percentile") {
                const sortedValues = [...values].sort((a, b) => a - b);
                const lowerIndex = Math.max(0, Math.floor(sortedValues.length * (threshold / 100)));
                const upperIndex = Math.min(sortedValues.length - 1, Math.floor(sortedValues.length * ((100 - threshold) / 100)));

                lowerBound = sortedValues[lowerIndex];
                upperBound = sortedValues[upperIndex];

                outlierCount = values.filter(value =>
                    value < lowerBound || value > upperBound
                ).length;
            }

            setOutlierStats({
                count: outlierCount,
                lowerBound: parseFloat(lowerBound.toFixed(2)),
                upperBound: parseFloat(upperBound.toFixed(2)),
                method: detectionMethod,
                threshold,
                hasRun: true
            });

            // 为可视化准备数据
            if (rawFileData) {
                const columnIndex = rawFileData.headers.indexOf(selectedColumn);
                if (columnIndex !== -1) {
                    const preparedData = rawFileData.rows.map((row, idx) => {
                        const rowData: Record<string, any> = { _index: idx };
                        rawFileData.headers.forEach((header, i) => {
                            rowData[header] = row[i];
                        });
                        return rowData;
                    });
                    setOutlierData(preparedData);
                }
            }

        } catch (error) {
            console.error("分析异常值时出错:", error);
            toast({
                title: "分析错误",
                description: error instanceof Error ? error.message : "分析异常值时出错",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    异常值处理选项
                </h4>

                <RadioGroup
                    value={outlierOption}
                    onValueChange={setOutlierOption}
                    className="space-y-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remove-outliers" id="remove-outliers" />
                        <Label htmlFor="remove-outliers">移除异常值</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cap-outliers" id="cap-outliers" />
                        <Label htmlFor="cap-outliers">截断异常值（使用边界值替换）</Label>
                    </div>
                </RadioGroup>

                <div className="pt-4 space-y-4">
                    <div className="flex items-center">
                        <Label className="mr-3 w-20">检测方法:</Label>
                        <Select
                            value={detectionMethod}
                            onValueChange={setDetectionMethod}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="zscore">Z-Score</SelectItem>
                                <SelectItem value="iqr">IQR（四分位数）</SelectItem>
                                <SelectItem value="percentile">百分位数</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center">
                        <Label className="mr-3 w-20">阈值:</Label>
                        <Input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            min={0}
                            step={detectionMethod === "percentile" ? 1 : 0.1}
                            max={detectionMethod === "percentile" ? 50 : 10}
                            className="w-20"
                        />
                        <span className="ml-2 text-xs text-gray-500">
                            {detectionMethod === "zscore" && "标准差倍数"}
                            {detectionMethod === "iqr" && "IQR倍数"}
                            {detectionMethod === "percentile" && "百分位（1-50）"}
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">方法说明：</p>
                        {detectionMethod === "zscore" && (
                            <>
                                <p className="mb-1"><span className="font-medium">Z-Score</span>：基于均值和标准差检测异常值。适用于呈正态分布的数据。</p>
                                <p>计算方式：<code>|x - 均值| / 标准差 &gt; 阈值</code>，默认阈值为3，表示超出3个标准差的值被视为异常值。</p>
                            </>
                        )}
                        {detectionMethod === "iqr" && (
                            <>
                                <p className="mb-1"><span className="font-medium">IQR (四分位距)</span>：基于四分位数范围检测异常值。不受极端值影响，适用于偏斜分布数据。</p>
                                <p>计算方式：异常值为小于 <code>Q1 - 阈值×IQR</code> 或大于 <code>Q3 + 阈值×IQR</code> 的值，其中 IQR = Q3 - Q1。</p>
                            </>
                        )}
                        {detectionMethod === "percentile" && (
                            <>
                                <p className="mb-1"><span className="font-medium">百分位数</span>：使用百分位数确定异常值边界。适合需要去除特定比例极端值的场景。</p>
                                <p>计算方式：将低于第<code>N</code>百分位或高于第<code>100-N</code>百分位的值视为异常值，<code>N</code>为设定的阈值。</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={analyzeOutliers}
                        disabled={isAnalyzing || !selectedColumn}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                分析中...
                            </>
                        ) : (
                            <>分析异常值</>
                        )}
                    </Button>
                </div>
            </div>

            {outlierStats.hasRun && (
                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center mb-2">
                            <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                            <h4 className="text-sm font-medium">异常值分析结果</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">检测方法:</p>
                                <p className="font-medium">
                                    {outlierStats.method === "zscore" && "Z-Score"}
                                    {outlierStats.method === "iqr" && "IQR (四分位数)"}
                                    {outlierStats.method === "percentile" && "百分位数"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">检测到的异常值数量:</p>
                                <p className="font-medium">{outlierStats.count}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">下边界:</p>
                                <p className="font-medium">{outlierStats.lowerBound}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">上边界:</p>
                                <p className="font-medium">{outlierStats.upperBound}</p>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                            {outlierOption === "remove-outliers"
                                ? `将移除${outlierStats.count}个超出边界的数据行`
                                : `将使用边界值替换${outlierStats.count}个异常值`}
                        </div>
                        <div className="mt-3 flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowVisualization(true)}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                查看详情
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showVisualization && outlierStats.hasRun && outlierData.length > 0 && (
                <OutliersVisualization
                    data={outlierData}
                    columnName={selectedColumn}
                    method={outlierStats.method}
                    threshold={outlierStats.threshold}
                    statistics={{
                        lowerBound: outlierStats.lowerBound,
                        upperBound: outlierStats.upperBound,
                        method: outlierStats.method,
                        threshold: outlierStats.threshold,
                        outlierCount: outlierStats.count,
                        totalCount: outlierData.length,
                        methodDetails: {
                            ...(outlierStats.method === "zscore" && rawFileData ? {
                                mean: mean(rawFileData.rows
                                    .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                                    .filter(v => v !== null && v !== undefined)
                                    .map(v => Number(v))
                                    .filter(v => !isNaN(v))),
                                stdDev: standardDeviation(rawFileData.rows
                                    .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                                    .filter(v => v !== null && v !== undefined)
                                    .map(v => Number(v))
                                    .filter(v => !isNaN(v)))
                            } : {}),
                            ...(outlierStats.method === "iqr" && rawFileData ? (() => {
                                const values = rawFileData.rows
                                    .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                                    .filter(v => v !== null && v !== undefined)
                                    .map(v => Number(v))
                                    .filter(v => !isNaN(v))
                                    .sort((a, b) => a - b);
                                const q1Index = Math.floor(values.length * 0.25);
                                const q3Index = Math.floor(values.length * 0.75);
                                const q1 = values[q1Index];
                                const q3 = values[q3Index];
                                return {
                                    q1,
                                    q3,
                                    iqr: q3 - q1
                                };
                            })() : {}),
                            ...(outlierStats.method === "percentile" ? {
                                lowerPercentile: threshold,
                                upperPercentile: 100 - threshold
                            } : {})
                        }
                    }}
                />
            )}
        </div>
    );
} 