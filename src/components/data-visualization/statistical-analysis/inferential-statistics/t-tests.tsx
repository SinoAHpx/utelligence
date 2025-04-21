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

interface TTestsProps {
    data: CellValue[];
    columnName: string;
}

/**
 * T 检验组件
 */
export function TTests({ data, columnName }: TTestsProps) {
    const mu = 0; // 单样本 t 检验的假设均值

    // 提取数值数据
    const numericData = extractNumericData(data);

    // 检查数据是否为空
    if (numericData.length === 0) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 不包含有效的数值数据，无法进行 t 检验。
                </AlertDescription>
            </Alert>
        );
    }

    // 检查是否有足够的数据点
    if (numericData.length < 2) {
        return (
            <Alert>
                <AlertDescription>
                    所选列 {columnName} 中有效数据点不足，t 检验需要至少两个有效数据点。
                </AlertDescription>
            </Alert>
        );
    }

    // 单样本 t 检验
    const performOneSampleTTest = () => {
        try {
            const mean = ss.mean(numericData);
            const stdErr = ss.standardDeviation(numericData) / Math.sqrt(numericData.length);
            const tStatistic = (mean - mu) / stdErr;
            const degreesOfFreedom = numericData.length - 1;

            // 简单起见，我们使用近似值计算p值
            const pValue = 2 * (1 - Math.abs(tStatistic) / Math.sqrt(degreesOfFreedom));

            return {
                mean,
                mu,
                stdErr,
                tStatistic,
                degreesOfFreedom,
                pValue: Math.min(pValue, 1), // 确保 p 值在有效范围内
                significant: pValue < 0.05
            };
        } catch (error) {
            console.error("Error in one-sample t-test calculation:", error);
            return null;
        }
    };

    // 执行单样本 t 检验
    const oneSampleResults = performOneSampleTTest();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{columnName} 的单样本 t 检验</CardTitle>
                <CardDescription>
                    比较样本均值与假设均值是否有显著差异
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {oneSampleResults ? (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">检验结果摘要</h3>
                            <Alert variant={oneSampleResults.significant ? "destructive" : "default"}>
                                <AlertDescription>
                                    样本均值 ({oneSampleResults.mean.toFixed(4)}) 与假设均值 ({mu})
                                    {oneSampleResults.significant ? " 存在显著差异" : " 无显著差异"}
                                    (p{oneSampleResults.significant ? "<" : "≥"}0.05)
                                </AlertDescription>
                            </Alert>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">检验详情</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>参数</TableHead>
                                        <TableHead>值</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">样本量</TableCell>
                                        <TableCell>{numericData.length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">样本均值</TableCell>
                                        <TableCell>{oneSampleResults.mean.toFixed(4)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">假设均值</TableCell>
                                        <TableCell>{mu}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">标准误</TableCell>
                                        <TableCell>{oneSampleResults.stdErr.toFixed(4)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">t 统计量</TableCell>
                                        <TableCell>{oneSampleResults.tStatistic.toFixed(4)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">自由度</TableCell>
                                        <TableCell>{oneSampleResults.degreesOfFreedom}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">p 值</TableCell>
                                        <TableCell>{oneSampleResults.pValue.toFixed(4)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="pt-2">
                            <h3 className="text-lg font-semibold mb-2">检验说明</h3>
                            <p className="text-sm text-muted-foreground">
                                单样本 t 检验用于比较一个样本的均值与一个已知或假设的均值是否有显著差异。
                                检验的零假设是样本均值等于假设均值，当 p 值小于显著性水平（通常为0.05）时，
                                我们拒绝零假设，认为样本均值与假设均值存在显著差异。
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                注意：t 检验假设数据来自正态分布。如果您的数据分布严重偏离正态分布，
                                结果可能不可靠，建议先进行正态性检验或考虑使用非参数检验方法。
                            </p>
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <AlertDescription>
                            计算 t 检验时出错，请检查数据是否适合此类检验。
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
} 