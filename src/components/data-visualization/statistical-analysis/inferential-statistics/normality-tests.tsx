"use client";

import React from "react";
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
import { formatStatValue } from "../../utils/analysis-helpers";
import { jarqueBera } from "@/utils/statistics/distribution-shape";

interface NormalityTestsProps {
    data: CellValue[];
    columnName: string;
}

/**
 * 正态性检验组件
 */
export function NormalityTests({ data, columnName }: NormalityTestsProps) {
    // 检查数据是否为空
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">暂无数据可供分析</p>
            </div>
        );
    }

    // 进行 Jarque-Bera 检验
    const jbResult = jarqueBera(data);

    // 检查是否有足够的数据点
    if (jbResult.statistic === null) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 数据量不足，无法进行正态性检验。正态性检验通常需要至少8个有效数据点。
                </AlertDescription>
            </Alert>
        );
    }

    // 判断是否符合正态分布
    const isNormal = jbResult.pValue !== null && jbResult.pValue >= 0.05;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的正态性检验</CardTitle>
                <CardDescription>
                    判断数据分布是否符合正态分布
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">检验结果摘要</h3>
                    <Alert variant={isNormal ? "default" : "destructive"}>
                        <AlertDescription>
                            根据 Jarque-Bera 检验结果，数据 {isNormal ? "符合" : "不符合"} 正态分布
                            (p{isNormal ? "≥" : "<"}0.05)
                        </AlertDescription>
                    </Alert>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">检验详情</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>检验方法</TableHead>
                                <TableHead>统计量</TableHead>
                                <TableHead>p值</TableHead>
                                <TableHead>结论</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Jarque-Bera 检验</TableCell>
                                <TableCell>{jbResult.statistic !== null ? jbResult.statistic.toFixed(4) : "N/A"}</TableCell>
                                <TableCell>{jbResult.pValue !== null ? jbResult.pValue.toFixed(4) : "N/A"}</TableCell>
                                <TableCell>
                                    {isNormal ? "符合正态分布" : "不符合正态分布"}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">检验说明</h3>
                    <p className="text-sm text-muted-foreground">
                        Jarque-Bera 检验是基于偏度和峰度来检验数据分布的正态性。
                        较大的统计量表示偏离正态分布的程度较高。当 p 值小于显著性水平（通常为0.05）时，
                        拒绝数据服从正态分布的原假设，认为数据不符合正态分布。
                    </p>
                </div>
            </CardContent>
        </Card>
    );
} 