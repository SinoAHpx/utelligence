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

interface CentralTendencyTabProps {
    data: CellValue[];
    columnName: string;
}

/**
 * 中心趋势分析标签页组件
 */
export function CentralTendencyTab({ data, columnName }: CentralTendencyTabProps) {
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
                    所选列 {columnName} 不包含数值数据，无法计算中心趋势。
                </AlertDescription>
            </Alert>
        );
    }

    // 计算各种中心趋势指标
    const metrics = useMemo(() => {
        // 排序数组以便计算中位数
        const sortedData = [...numericData].sort((a, b) => a - b);

        // 计算均值
        const mean = numericData.reduce((sum, value) => sum + value, 0) / numericData.length;

        // 计算中位数
        const midIndex = Math.floor(sortedData.length / 2);
        const median = sortedData.length % 2 === 0
            ? (sortedData[midIndex - 1] + sortedData[midIndex]) / 2
            : sortedData[midIndex];

        // 计算众数
        const frequencyMap = new Map<number, number>();
        numericData.forEach(value => {
            frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
        });

        let maxFrequency = 0;
        let modes: number[] = [];

        frequencyMap.forEach((frequency, value) => {
            if (frequency > maxFrequency) {
                maxFrequency = frequency;
                modes = [value];
            } else if (frequency === maxFrequency) {
                modes.push(value);
            }
        });

        const modeText = modes.length <= 3
            ? modes.map(m => m.toFixed(2)).join(", ")
            : "多个众数";

        return {
            mean: mean.toFixed(4),
            median: median.toFixed(4),
            mode: modeText,
            count: numericData.length,
            min: Math.min(...numericData).toFixed(4),
            max: Math.max(...numericData).toFixed(4),
        };
    }, [numericData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的中心趋势分析</CardTitle>
                <CardDescription>
                    展示数据集的中心位置和范围指标
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
                            <TableCell className="font-medium">平均值</TableCell>
                            <TableCell>{metrics.mean}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">所有值的算术平均</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">中位数</TableCell>
                            <TableCell>{metrics.median}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">排序后处于中间位置的值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">众数</TableCell>
                            <TableCell>{metrics.mode}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">出现频率最高的值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">样本数</TableCell>
                            <TableCell>{metrics.count}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数值型数据点的数量</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">最小值</TableCell>
                            <TableCell>{metrics.min}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据集中的最小值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">最大值</TableCell>
                            <TableCell>{metrics.max}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据集中的最大值</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 