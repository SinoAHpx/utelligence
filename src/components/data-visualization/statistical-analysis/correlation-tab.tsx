"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { processFileData } from "@/utils/data-processing";
import { convertToNumericArray } from "@/utils/statistics/utils";
import * as ss from "simple-statistics";

interface CorrelationTabProps {
    selectedColumns: string[];
    file?: File | null;
}

interface CorrelationData {
    columns: string[];
    correlationMatrix: (number | null)[][];
    isLoading: boolean;
}

/**
 * 计算两个数值数组之间的皮尔逊相关系数
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number | null {
    if (x.length < 3 || y.length < 3 || x.length !== y.length) {
        return null;
    }

    try {
        return ss.sampleCorrelation(x, y);
    } catch (error) {
        console.error("Error calculating correlation:", error);
        return null;
    }
}

/**
 * 相关性分析标签页组件
 */
export function CorrelationTab({ selectedColumns, file }: CorrelationTabProps) {
    const [correlationData, setCorrelationData] = useState<CorrelationData>({
        columns: [],
        correlationMatrix: [],
        isLoading: false
    });

    useEffect(() => {
        if (!file || selectedColumns.length < 2) return;

        setCorrelationData(prev => ({ ...prev, isLoading: true }));

        processFileData(
            file,
            (data) => {
                const headers = data.headers;
                const rows = data.rows;

                // 提取所选列的数据，并检查每列是否包含数值
                const columnsData: { column: string; data: number[] }[] = [];

                for (const column of selectedColumns) {
                    const colIndex = headers.indexOf(column);
                    if (colIndex !== -1) {
                        const colData = rows.map(row => row[colIndex]);
                        const numericData = convertToNumericArray(colData);

                        // 只保留包含足够数值的列
                        if (numericData.length > 0) {
                            columnsData.push({
                                column,
                                data: numericData
                            });
                        }
                    }
                }

                // 计算相关矩阵
                const numericColumns = columnsData.map(col => col.column);
                const matrix: (number | null)[][] = [];

                for (let i = 0; i < columnsData.length; i++) {
                    matrix[i] = [];
                    for (let j = 0; j < columnsData.length; j++) {
                        if (i === j) {
                            matrix[i][j] = 1; // 自身相关性为1
                        } else {
                            matrix[i][j] = calculatePearsonCorrelation(
                                columnsData[i].data,
                                columnsData[j].data
                            );
                        }
                    }
                }

                setCorrelationData({
                    columns: numericColumns,
                    correlationMatrix: matrix,
                    isLoading: false
                });
            },
            (error) => {
                console.error("Error processing file for correlation:", error);
                setCorrelationData({
                    columns: [],
                    correlationMatrix: [],
                    isLoading: false
                });
            }
        );
    }, [file, selectedColumns]);

    if (selectedColumns.length < 2) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">请选择至少两列数据进行相关性分析</p>
            </div>
        );
    }

    if (correlationData.isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">正在计算相关性...</p>
            </div>
        );
    }

    if (correlationData.columns.length < 2) {
        return (
            <div className="flex items-center justify-center h-40">
                <Alert>
                    <AlertDescription>
                        所选列中没有足够的数值数据进行相关性分析。请选择包含数值的列。
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 根据相关系数值选择不同的样式和颜色
    const getCorrelationStyle = (value: number | null) => {
        if (value === null) return { variant: "outline", className: "" };

        const absValue = Math.abs(value);

        if (absValue >= 0.7) {
            return {
                variant: value >= 0 ? "default" : "destructive",
                className: "font-bold"
            };
        } else if (absValue >= 0.4) {
            return {
                variant: value >= 0 ? "default" : "destructive",
                className: ""
            };
        } else {
            return {
                variant: "outline",
                className: "text-gray-500"
            };
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>相关性分析</CardTitle>
                <CardDescription>
                    查看变量之间的皮尔逊相关系数
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>变量</TableHead>
                            {correlationData.columns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {correlationData.columns.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell className="font-medium">{row}</TableCell>
                                {correlationData.columns.map((col, colIndex) => {
                                    const correlationValue = correlationData.correlationMatrix[rowIndex][colIndex];
                                    const style = getCorrelationStyle(correlationValue);

                                    return (
                                        <TableCell key={colIndex}>
                                            {correlationValue !== null ? (
                                                <Badge
                                                    variant={style.variant as any}
                                                    className={style.className}
                                                >
                                                    {correlationValue.toFixed(2)}
                                                </Badge>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4 text-sm text-gray-500">
                    <p>相关系数解释: </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>0.7-1.0: 强正相关</li>
                        <li>0.4-0.7: 中等正相关</li>
                        <li>0-0.4: 弱正相关</li>
                        <li>-0.4-0: 弱负相关</li>
                        <li>-0.7--0.4: 中等负相关</li>
                        <li>-1.0--0.7: 强负相关</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
} 