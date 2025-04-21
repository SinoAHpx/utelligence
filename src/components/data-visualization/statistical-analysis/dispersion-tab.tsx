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

interface DispersionTabProps {
    data: CellValue[];
    columnName: string;
}

/**
 * 离散程度分析标签页组件
 */
export function DispersionTab({ data, columnName }: DispersionTabProps) {
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
                    所选列 {columnName} 不包含数值数据，无法计算离散程度。
                </AlertDescription>
            </Alert>
        );
    }

    if (numericData.length < 2) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 只包含一个数值数据点，无法计算离散程度。需要至少两个数据点。
                </AlertDescription>
            </Alert>
        );
    }

    // 计算各种离散程度指标
    const metrics = useMemo(() => {
        // 计算平均值
        const mean = numericData.reduce((sum, value) => sum + value, 0) / numericData.length;

        // 计算方差和标准差
        const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
        const stdDev = Math.sqrt(variance);

        // 排序数组以便计算范围和四分位数
        const sortedData = [...numericData].sort((a, b) => a - b);

        // 计算范围
        const range = sortedData[sortedData.length - 1] - sortedData[0];

        // 计算四分位数
        const q1Index = Math.floor(sortedData.length * 0.25);
        const q3Index = Math.floor(sortedData.length * 0.75);

        const q1 = sortedData.length % 4 === 0
            ? (sortedData[q1Index - 1] + sortedData[q1Index]) / 2
            : sortedData[q1Index];

        const q3 = sortedData.length % 4 === 0
            ? (sortedData[q3Index - 1] + sortedData[q3Index]) / 2
            : sortedData[q3Index];

        // 四分位距
        const iqr = q3 - q1;

        // 计算变异系数
        const cv = (stdDev / Math.abs(mean)) * 100;

        return {
            variance: variance.toFixed(4),
            stdDev: stdDev.toFixed(4),
            range: range.toFixed(4),
            iqr: iqr.toFixed(4),
            q1: q1.toFixed(4),
            q3: q3.toFixed(4),
            cv: cv.toFixed(2)
        };
    }, [numericData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的离散程度分析</CardTitle>
                <CardDescription>
                    展示数据集的分散程度指标
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
                            <TableCell className="font-medium">方差</TableCell>
                            <TableCell>{metrics.variance}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据点与平均值偏差的平方的平均值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">标准差</TableCell>
                            <TableCell>{metrics.stdDev}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">方差的平方根，与原始数据单位一致</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">变异系数</TableCell>
                            <TableCell>{metrics.cv}%</TableCell>
                            <TableCell className="text-sm text-muted-foreground">标准化的标准差，可用于不同单位数据的比较</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">全距</TableCell>
                            <TableCell>{metrics.range}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">最大值与最小值的差</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">四分位距</TableCell>
                            <TableCell>{metrics.iqr}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">第三四分位数与第一四分位数的差</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">第一四分位数</TableCell>
                            <TableCell>{metrics.q1}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">25%的数据小于或等于此值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">第三四分位数</TableCell>
                            <TableCell>{metrics.q3}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">75%的数据小于或等于此值</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 