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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MissingValuesTab from "./MissingValuesTab";
import OutliersTab from "./OutliersTab";
import DuplicatesTab from "./DuplicatesTab";
import { TransformTab } from "./TransformTab";
import { exportCleanedData } from "@/utils/data-processing";
import { CheckIcon, FileDown, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";

interface DataCleaningProps {
    file: File | null;
    availableColumns: string[];
    onColumnsChange: (columns: string[]) => void;
}

export default function DataCleaning({
    file,
    availableColumns,
    onColumnsChange,
}: DataCleaningProps) {
    const [activeTab, setActiveTab] = useState("missing");
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cleaningComplete, setCleaningComplete] = useState(false);
    const [cleaningInProgress, setCleaningInProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    // Zustand store
    const {
        rawFileData,
        cleanedData,
        processAndAnalyzeFile,
    } = useDataVisualizationStore();

    // Missing values state
    const [missingValues, setMissingValues] = useState<{
        [key: string]: { strategy: string; value?: string | number };
    }>({});

    // Outliers state
    const [outlierSettings, setOutlierSettings] = useState<{
        [key: string]: {
            method: string;
            action: string;
            lowerThreshold?: number;
            upperThreshold?: number;
            multiplier?: number;
            replacementMethod?: string;
            replacementValue?: number;
        };
    }>({});

    // Duplicates state
    const [duplicateSettings, setDuplicateSettings] = useState<{
        columnsToCheck: string[];
        strategy: string;
    }>({
        columnsToCheck: [],
        strategy: "remove_first",
    });

    const tabOptions = [
        { id: "missing", name: "缺失值处理" },
        { id: "outliers", name: "异常值处理" },
        { id: "duplicates", name: "重复值处理" },
        { id: "transform", name: "数据转换" },
    ];

    // Load data from file when it changes
    useEffect(() => {
        if (file && (!rawFileData || rawFileData.headers.length === 0)) {
            setIsLoading(true);
            setErrorMessage(null);
            setCleaningComplete(false);

            processAndAnalyzeFile(file, availableColumns)
                .then(() => {
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error processing file:", error);
                    setErrorMessage(`处理文件出错: ${error}`);
                    setIsLoading(false);
                });
        }
    }, [file, rawFileData, availableColumns, processAndAnalyzeFile]);

    // Update selected columns when available columns change
    useEffect(() => {
        if (availableColumns.length > 0) {
            setSelectedColumns(prevSelected =>
                prevSelected.filter((col) => availableColumns.includes(col))
            );
        }
    }, [availableColumns]);

    // Reset cleaning status when tab changes
    useEffect(() => {
        setCleaningComplete(false);
        setErrorMessage(null);
    }, [activeTab]);

    // Reset cleaning status when settings change
    useEffect(() => {
        if (activeTab === "missing" && Object.keys(missingValues).length > 0) {
            setCleaningComplete(false);
        }
    }, [missingValues, activeTab]);

    useEffect(() => {
        if (activeTab === "outliers" && Object.keys(outlierSettings).length > 0) {
            setCleaningComplete(false);
        }
    }, [outlierSettings, activeTab]);

    useEffect(() => {
        if (activeTab === "duplicates" && duplicateSettings.columnsToCheck.length > 0) {
            setCleaningComplete(false);
        }
    }, [duplicateSettings, activeTab]);

    // Handle data export
    const handleExport = async () => {
        if (!file || !cleanedData) return;

        try {
            const originalFilename = file.name;
            const baseName = originalFilename.substring(
                0,
                originalFilename.lastIndexOf(".")
            );
            const extension = originalFilename.substring(
                originalFilename.lastIndexOf(".")
            );
            const cleanedFilename = `${baseName}_cleaned${extension}`;

            await exportCleanedData(cleanedData, cleanedFilename);

            toast({
                title: "数据导出成功",
                description: `清洗后的数据已成功导出到文件: ${cleanedFilename}`,
            });
        } catch (error) {
            console.error("Error exporting data:", error);
            toast({
                title: "导出失败",
                description: `导出数据时发生错误: ${error}`,
                variant: "destructive",
            });
        }
    };

    // Common props for all tab components
    const tabProps = {
        file,
        availableColumns,
        rawData: rawFileData,
        onComplete: () => setCleaningComplete(true),
        onProgress: (value: number) => setProgress(value),
        onProcessingStart: () => {
            setCleaningInProgress(true);
            setErrorMessage(null);
            setProgress(0);
        },
        onProcessingEnd: () => {
            setCleaningInProgress(false);
        },
        onError: (error: string) => {
            setErrorMessage(error);
            setCleaningInProgress(false);
        }
    };

    if (!file) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <Tabs
                defaultValue="missing"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList>
                    {tabOptions.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {errorMessage && (
                    <Alert className="my-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {cleaningInProgress && (
                    <div className="my-4 space-y-2">
                        <p>正在处理数据，请稍候...</p>
                        <Progress value={progress} className="w-full" />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <p>正在加载数据，请稍候...</p>
                    </div>
                ) : (
                    <>
                        <TabsContent value="missing" className="mt-4">
                            <MissingValuesTab
                                {...tabProps}
                                columns={availableColumns}
                                onSettingsChange={setMissingValues}
                            />
                        </TabsContent>

                        <TabsContent value="outliers" className="mt-4">
                            <OutliersTab
                                {...tabProps}
                                columns={availableColumns}
                                onSettingsChange={setOutlierSettings}
                            />
                        </TabsContent>

                        <TabsContent value="duplicates" className="mt-4">
                            <DuplicatesTab
                                {...tabProps}
                                columns={availableColumns}
                                onSettingsChange={setDuplicateSettings}
                            />
                        </TabsContent>

                        <TabsContent value="transform" className="mt-4">
                            <TransformTab
                                {...tabProps}
                                selectedColumn=""
                                selectedColumns={selectedColumns}
                                setMessage={(message) => setErrorMessage(message)}
                                setProcessedFileUrl={() => { }}
                                setCleaned={(cleaned) => setCleaningComplete(cleaned)}
                                rawFileData={rawFileData}
                            />
                        </TabsContent>

                        <div className="flex justify-end mt-6">
                            {cleanedData && cleanedData.headers.length > 0 && cleaningComplete && (
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    className="ml-2"
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    导出清洗后的数据
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Tabs>
        </div>
    );
} 