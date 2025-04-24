"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ChevronLeft } from "lucide-react";
import FileUploader from "./file-upload/file-uploader";
import FilePreview from "./file-upload/file-preview";
import DuplicatesVisualization from "./duplicates-visualization";
import OutliersVisualization from "./outliers-visualization";
import { useFilePreviewStore } from "@/store/filePreviewStore";
import { detectDuplicatesWithStore } from "@/utils/data/analysis/duplicate-detection";
import { detectOutliersWithStore } from "@/utils/data/analysis/outlier-detection";

export default function DataAnalysisContainer() {
    const [activeTab, setActiveTab] = useState("file-preview");
    const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
    const { file, parsedData, selectedColumns } = useFilePreviewStore();

    // 监听 visualize 事件，切换到可视化标签
    useEffect(() => {
        const handleVisualize = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail && customEvent.detail.columns) {
                setActiveTab("data-analysis");
            }
        };

        window.addEventListener("visualize", handleVisualize);
        return () => {
            window.removeEventListener("visualize", handleVisualize);
        };
    }, []);

    // 根据选择的分析类型显示不同的分析组件
    const renderAnalysisComponent = () => {
        switch (currentAnalysis) {
            case "duplicates":
                if (parsedData && selectedColumns.length > 0) {
                    // 转换数据为对象数组
                    const data = parsedData.data.map((row) => {
                        const obj: Record<string, any> = {};
                        parsedData.headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    // 执行重复数据检测并更新 store
                    detectDuplicatesWithStore(data, selectedColumns);

                    // 显示重复数据分析组件
                    return (
                        <div className="mt-4">
                            <div className="mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentAnalysis(null)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    返回分析选择
                                </Button>
                            </div>
                            <DuplicatesVisualization />
                        </div>
                    );
                }
                return null;

            case "outliers":
                if (parsedData && selectedColumns.length > 0) {
                    // 只有在选择了一列数值型数据时才能进行异常值分析
                    const targetColumn = selectedColumns[0];

                    // 转换数据为对象数组
                    const data = parsedData.data.map((row) => {
                        const obj: Record<string, any> = {};
                        parsedData.headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    // 执行异常值检测并更新 store
                    detectOutliersWithStore(data, targetColumn);

                    // 显示异常值分析组件
                    return (
                        <div className="mt-4">
                            <div className="mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentAnalysis(null)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    返回分析选择
                                </Button>
                            </div>
                            <OutliersVisualization />
                        </div>
                    );
                }
                return (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-gray-500">请选择一列数值型数据进行异常值分析</p>
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>重复数据分析</CardTitle>
                                <CardDescription>
                                    检测并分析数据中的重复行
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">
                                    此分析将帮助您找出数据中的重复记录，以便清理和去重。
                                </p>
                                <Button
                                    onClick={() => setCurrentAnalysis("duplicates")}
                                    disabled={!parsedData || selectedColumns.length === 0}
                                >
                                    进行重复数据分析
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>异常值分析</CardTitle>
                                <CardDescription>
                                    识别数值列中的异常值或离群点
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">
                                    此分析将帮助您检测数值数据中偏离正常范围的异常值。
                                </p>
                                <Button
                                    onClick={() => setCurrentAnalysis("outliers")}
                                    disabled={!parsedData || selectedColumns.length !== 1}
                                >
                                    进行异常值分析
                                </Button>
                                {parsedData && selectedColumns.length > 1 && (
                                    <p className="text-xs text-red-500 mt-2">
                                        请只选择一列数值型数据进行异常值分析
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-6">数据分析工具</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="file-upload">上传文件</TabsTrigger>
                    <TabsTrigger value="file-preview">文件预览</TabsTrigger>
                    <TabsTrigger value="data-analysis">数据分析</TabsTrigger>
                </TabsList>

                <TabsContent value="file-upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>上传数据文件</CardTitle>
                            <CardDescription>
                                支持 CSV 和 Excel 格式的数据文件
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUploader />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="file-preview">
                    <Card>
                        <CardHeader>
                            <CardTitle>文件预览</CardTitle>
                            <CardDescription>
                                查看数据并选择要分析的列
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FilePreview onColumnsAvailable={(columns) => console.log("Columns available:", columns)} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data-analysis">
                    <Card>
                        <CardHeader>
                            <CardTitle>数据分析</CardTitle>
                            <CardDescription>
                                选择数据分析类型
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!file ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">请先上传数据文件</p>
                                    <Button onClick={() => setActiveTab("file-upload")}>
                                        去上传文件
                                    </Button>
                                </div>
                            ) : selectedColumns.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">请在文件预览中选择要分析的列</p>
                                    <Button onClick={() => setActiveTab("file-preview")}>
                                        去选择列
                                    </Button>
                                </div>
                            ) : (
                                renderAnalysisComponent()
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 