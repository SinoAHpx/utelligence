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
import { getDispersionMetrics, formatStatValue } from "../../../utils/data/visualization/analysis-helpers";

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

    // 使用helper函数获取离散程度指标
    const metrics = getDispersionMetrics(data);

    // 检查是否有足够数值数据
    if (!metrics) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 不包含数值数据，无法计算离散程度。
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的离散程度分析</CardTitle>
                <CardDescription>
                    展示数据分散程度的指标
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
                            <TableCell>{formatStatValue(metrics.variance)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">数据与均值差异的平方的平均值</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">标准差</TableCell>
                            <TableCell>{formatStatValue(metrics.standardDeviation)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">方差的平方根，表示数据的分散程度</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 