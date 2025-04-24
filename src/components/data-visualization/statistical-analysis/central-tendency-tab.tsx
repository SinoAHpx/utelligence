"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/shadcn/table";
import { CellValue } from "@/utils/data/statistics/types";
import { getCentralTendencyMetrics, formatStatValue } from "../../../utils/data/visualization/analysis-helpers";

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

    // 使用helper函数获取中心趋势指标
    const metrics = getCentralTendencyMetrics(data);

    // 检查是否有足够数值数据
    if (!metrics) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 不包含数值数据，无法计算中心趋势。
                </AlertDescription>
            </Alert>
        );
    }

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
                            <TableCell>{formatStatValue(metrics.mean)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">所有值的算术平均</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">中位数</TableCell>
                            <TableCell>{formatStatValue(metrics.median)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">排序后处于中间位置的值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">众数</TableCell>
                            <TableCell>{formatStatValue(metrics.mode)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">出现频率最高的值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">样本数</TableCell>
                            <TableCell>{metrics.count}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数值型数据点的数量</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">最小值</TableCell>
                            <TableCell>{formatStatValue(metrics.min)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据集中的最小值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">最大值</TableCell>
                            <TableCell>{formatStatValue(metrics.max)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据集中的最大值</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 