"use client";

import React from "react";
import { Card } from "@/components/ui/shadcn/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/shadcn/table";
import { StatisticResult } from "@/utils/data/statistics/types";

interface StatisticsTableProps {
    stats: StatisticResult[];
    formatValue: (value: any) => string;
}

/**
 * 展示统计结果的表格组件
 */
export function StatisticsTable({ stats, formatValue }: StatisticsTableProps) {
    if (!stats || stats.length === 0) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">暂无统计数据</p>
            </div>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[60%]">指标</TableHead>
                        <TableHead>值</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stats.map((stat, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="font-medium">{stat.name}</TableCell>
                            <TableCell>{formatValue(stat.value)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
} 