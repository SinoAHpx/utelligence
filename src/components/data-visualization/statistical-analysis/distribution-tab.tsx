"use client";

import React, { useMemo } from "react";
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
    TableCell
} from "@/components/ui/table";
import { CellValue } from "@/utils/statistics/types";

interface DistributionTabProps {
    data: CellValue[];
    columnName: string;
}

/**
 * 分布形态分析标签页组件
 */
export function DistributionTab({ data, columnName }: DistributionTabProps) {
    // 检查数据是否为空
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">暂无数据可供分析</p>
            </div>
        );
    }

    // 过滤出数值类型数据
    const numericData = useMemo(() => {
        return data.filter(value =>
            typeof value === 'number' && !isNaN(value)
        ) as number[];
    }, [data]);

    // 检查是否有足够数值数据
    if (numericData.length === 0) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 不包含数值数据，无法计算分布形态指标。
                </AlertDescription>
            </Alert>
        );
    }

    if (numericData.length < 3) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 数据点不足，无法可靠计算分布形态指标。需要至少三个数据点。
                </AlertDescription>
            </Alert>
        );
    }

    // 计算各种分布形态指标
    const metrics = useMemo(() => {
        // 计算平均值
        const mean = numericData.reduce((sum, value) => sum + value, 0) / numericData.length;

        // 计算方差和标准差
        const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
        const stdDev = Math.sqrt(variance);

        // 计算偏度 (Skewness)
        // 使用Fisher-Pearson系数
        const skewness = numericData.reduce((sum, value) => {
            return sum + Math.pow((value - mean) / stdDev, 3);
        }, 0) * (numericData.length / ((numericData.length - 1) * (numericData.length - 2)));

        // 计算峰度 (Kurtosis)
        // 使用Fisher峰度（正态分布的峰度为0）
        const kurtosis = numericData.reduce((sum, value) => {
            return sum + Math.pow((value - mean) / stdDev, 4);
        }, 0) * (numericData.length * (numericData.length + 1) / ((numericData.length - 1) * (numericData.length - 2) * (numericData.length - 3)))
            - (3 * Math.pow(numericData.length - 1, 2) / ((numericData.length - 2) * (numericData.length - 3)));

        // 百分位数
        const sortedData = [...numericData].sort((a, b) => a - b);

        const percentile = (p: number) => {
            if (p < 0 || p > 100) throw new Error('百分位数必须在0-100之间');

            if (p === 0) return sortedData[0];
            if (p === 100) return sortedData[sortedData.length - 1];

            const index = (sortedData.length - 1) * p / 100;
            const lower = Math.floor(index);
            const upper = Math.ceil(index);

            if (lower === upper) return sortedData[lower];

            const fraction = index - lower;
            return sortedData[lower] * (1 - fraction) + sortedData[upper] * fraction;
        };

        // 计算关键的百分位数
        const p10 = percentile(10);
        const p25 = percentile(25);
        const p75 = percentile(75);
        const p90 = percentile(90);

        return {
            skewness: skewness.toFixed(4),
            kurtosis: kurtosis.toFixed(4),
            p10: p10.toFixed(4),
            p25: p25.toFixed(4),
            p75: p75.toFixed(4),
            p90: p90.toFixed(4),
            normalityTest: Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 0.5
                ? "数据分布近似正态"
                : "数据分布偏离正态分布"
        };
    }, [numericData]);

    // 偏度解释
    const getSkewnessDescription = (skewness: number) => {
        const value = parseFloat(skewness.toString());
        if (Math.abs(value) < 0.5) return "数据分布近似对称";
        if (value > 0) return "数据呈右偏分布（正偏度），有较长的右尾";
        return "数据呈左偏分布（负偏度），有较长的左尾";
    };

    // 峰度解释
    const getKurtosisDescription = (kurtosis: number) => {
        const value = parseFloat(kurtosis.toString());
        if (Math.abs(value) < 0.5) return "数据峰度接近正态分布";
        if (value > 0) return "数据分布尖峰（峰度大于正态分布），尾部较重";
        return "数据分布平坦（峰度小于正态分布），尾部较轻";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的分布形态分析</CardTitle>
                <CardDescription>
                    分析数据的偏度、峰度和分布特点
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>指标</TableHead>
                            <TableHead>值</TableHead>
                            <TableHead>描述</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">偏度</TableCell>
                            <TableCell>{metrics.skewness}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {getSkewnessDescription(parseFloat(metrics.skewness))}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">峰度</TableCell>
                            <TableCell>{metrics.kurtosis}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {getKurtosisDescription(parseFloat(metrics.kurtosis))}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">正态性检验</TableCell>
                            <TableCell colSpan={2}>{metrics.normalityTest}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">10%分位数</TableCell>
                            <TableCell>{metrics.p10}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">10%的数据小于或等于此值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">25%分位数</TableCell>
                            <TableCell>{metrics.p25}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">25%的数据小于或等于此值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">75%分位数</TableCell>
                            <TableCell>{metrics.p75}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">75%的数据小于或等于此值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">90%分位数</TableCell>
                            <TableCell>{metrics.p90}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">90%的数据小于或等于此值</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 