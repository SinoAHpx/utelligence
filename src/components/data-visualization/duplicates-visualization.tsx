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
    TableCell,
} from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { InfoIcon, Download, Filter, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Badge } from "@/components/ui/shadcn/badge";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/shadcn/accordion";
import { useDuplicatesStore } from "@/store/duplicatesStore";

export default function DuplicatesVisualization() {
    // Use Zustand store directly
    const {
        data,
        selectedColumns,
        duplicateGroups,
        statistics,
        activeTab,
        setActiveTab
    } = useDuplicatesStore();

    // 计算百分比
    const duplicatePercentage = ((statistics.duplicateCount / statistics.totalRows) * 100).toFixed(2);

    // 渲染摘要信息
    const renderSummary = () => {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card className="bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">总行数</p>
                            <p className="text-2xl font-semibold">{statistics.totalRows}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">唯一行数</p>
                            <p className="text-2xl font-semibold">{statistics.uniqueRows}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">重复数据组</p>
                            <p className="text-2xl font-semibold">{duplicateGroups.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">重复数据行</p>
                            <p className="text-2xl font-semibold">{statistics.duplicateCount}</p>
                            <p className="text-xs text-gray-500 mt-1">占总数据的 {duplicatePercentage}%</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center mb-2">
                            <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                            <h4 className="text-sm font-medium">基于以下列进行重复检测</h4>
                        </div>

                        <div className="flex flex-wrap gap-2 my-2">
                            {selectedColumns.map((column, index) => (
                                <Badge key={index} variant="secondary">
                                    {column}
                                </Badge>
                            ))}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                            <p>重复判定: 当选定列的值完全一致时，视为重复行</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // 渲染重复数据组
    const renderDuplicateGroups = () => {
        if (duplicateGroups.length === 0) {
            return (
                <Alert>
                    <AlertDescription>未检测到重复数据</AlertDescription>
                </Alert>
            );
        }

        // 排序重复组：按重复次数降序
        const sortedGroups = [...duplicateGroups].sort((a, b) => b.count - a.count);

        return (
            <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">
                    共检测到 {sortedGroups.length} 组重复数据，按重复次数降序排列
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {sortedGroups.map((group, groupIndex) => {
                        // 获取此组的第一行数据作为预览
                        const previewRow = group.rows[0];
                        const columns = Object.keys(previewRow).filter(key => key !== '_index');

                        return (
                            <AccordionItem value={`group-${groupIndex}`} key={groupIndex}>
                                <AccordionTrigger className="hover:bg-slate-50 dark:hover:bg-slate-900 px-3 py-2 rounded-md">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <Badge className="mr-2 bg-blue-500">{group.count}</Badge>
                                            <span className="text-sm">重复组 #{groupIndex + 1}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 hidden sm:block">
                                            {selectedColumns.map(col => `${col}: ${previewRow[col]}`).join(', ')}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="px-1 pb-2">
                                        <ScrollArea className="h-[300px] rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-14">行号</TableHead>
                                                        {columns.map((col) => (
                                                            <TableHead
                                                                key={col}
                                                                className={selectedColumns.includes(col) ? "font-bold" : ""}
                                                            >
                                                                {col}
                                                                {selectedColumns.includes(col) &&
                                                                    <Badge className="ml-2 bg-blue-500">对比列</Badge>
                                                                }
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.rows.map((row, rowIndex) => (
                                                        <TableRow key={`row-${rowIndex}`}>
                                                            <TableCell className="font-mono">{row._index}</TableCell>
                                                            {columns.map((col) => (
                                                                <TableCell
                                                                    key={`cell-${rowIndex}-${col}`}
                                                                    className={selectedColumns.includes(col) ? "font-semibold bg-blue-50 dark:bg-blue-900/20" : ""}
                                                                >
                                                                    {row[col]}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>重复数据分析</CardTitle>
                        <CardDescription>
                            基于 {selectedColumns.length} 列检测到的重复数据
                        </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            导出数据
                        </Button>
                        <Button size="sm" variant="outline">
                            <Filter className="h-4 w-4 mr-1" />
                            筛选
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-2">
                        <TabsList>
                            <TabsTrigger value="summary">摘要</TabsTrigger>
                            <TabsTrigger value="details">重复数据组</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="summary">
                        {renderSummary()}
                    </TabsContent>

                    <TabsContent value="details">
                        {renderDuplicateGroups()}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 