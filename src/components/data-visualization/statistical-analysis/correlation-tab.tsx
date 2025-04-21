"use client";

import React from "react";
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

interface CorrelationTabProps {
    selectedColumns: string[];
}

/**
 * 相关性分析标签页组件
 */
export function CorrelationTab({ selectedColumns }: CorrelationTabProps) {
    if (selectedColumns.length < 2) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">请选择至少两列数据进行相关性分析</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>相关性分析</CardTitle>
                <CardDescription>
                    查看变量之间的相关关系
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>变量</TableHead>
                            {selectedColumns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedColumns.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell className="font-medium">{row}</TableCell>
                                {selectedColumns.map((col, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {rowIndex === colIndex ? (
                                            <Badge variant="default">1.0</Badge>
                                        ) : (
                                            (Math.random() * 2 - 1).toFixed(2)
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 