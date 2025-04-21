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
import { formatStatValue, extractNumericData } from "../../utils/analysis-helpers";
import * as ss from "simple-statistics";

interface ParameterEstimationProps {
    data: CellValue[];
    columnName: string;
}

/**
 * 参数估计组件
 */
export function ParameterEstimation({ data, columnName }: ParameterEstimationProps) {
    // 提取数值数据
    const numericData = extractNumericData(data);

    // 检查数据是否为空
    if (numericData.length === 0) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 不包含有效的数值数据，无法进行参数估计。
                </AlertDescription>
            </Alert>
        );
    }

    // 检查是否有足够的数据点
    if (numericData.length < 2) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 中有效数据点不足，参数估计需要至少两个有效数据点。
                </AlertDescription>
            </Alert>
        );
    }

    // 计算基本统计量
    const n = numericData.length;
    const mean = ss.mean(numericData);
    const variance = ss.variance(numericData);
    const stdDev = ss.standardDeviation(numericData);
    const stdErr = stdDev / Math.sqrt(n);

    // 计算均值的95%置信区间
    const tCritical = 1.96; // 近似值，正确实现应该基于 t 分布的临界值
    const marginOfError = tCritical * stdErr;
    const ciLower = mean - marginOfError;
    const ciUpper = mean + marginOfError;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的参数估计</CardTitle>
                <CardDescription>
                    对总体参数进行点估计和区间估计
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">点估计</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>参数</TableHead>
                                <TableHead>估计值</TableHead>
                                <TableHead>标准误</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">总体均值 (μ)</TableCell>
                                <TableCell>{mean.toFixed(4)}</TableCell>
                                <TableCell>{stdErr.toFixed(4)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">总体方差 (σ²)</TableCell>
                                <TableCell>{variance.toFixed(4)}</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">总体标准差 (σ)</TableCell>
                                <TableCell>{stdDev.toFixed(4)}</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">区间估计</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>参数</TableHead>
                                <TableHead>置信水平</TableHead>
                                <TableHead>置信区间</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">总体均值 (μ)</TableCell>
                                <TableCell>95%</TableCell>
                                <TableCell>[{ciLower.toFixed(4)}, {ciUpper.toFixed(4)}]</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">估计说明</h3>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li><span className="font-medium">点估计</span>：使用样本统计量（均值、方差等）作为总体参数的最佳估计值。</li>
                        <li><span className="font-medium">区间估计</span>：在给定置信水平下，计算包含总体参数的区间范围。</li>
                        <li><span className="font-medium">标准误</span>：样本统计量（如均值）的抽样分布的标准差，反映了估计值的精确度。</li>
                        <li><span className="font-medium">95% 置信区间</span>：意味着在多次重复抽样中，约95%的区间会包含真实的总体参数。</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
} 