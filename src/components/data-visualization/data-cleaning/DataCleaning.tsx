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
import { processFileData, exportCleanedData } from "@/utils/data-processing";
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
        setCleanedData,
        processAndAnalyzeFile,
        updateCleanedData,
        handleOperation
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
    ];

    // Load data from file when it changes
    useEffect(() => {
        if (file && (!rawFileData || rawFileData.headers.length === 0)) {
            setIsLoading(true);
            setErrorMessage(null);

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
            setSelectedColumns(
                selectedColumns.filter((col) => availableColumns.includes(col))
            );
        }
    }, [availableColumns, selectedColumns]);

    // Handle missing values processing
    const handleMissingValues = async () => {
        if (!file || !rawFileData || Object.keys(missingValues).length === 0) return;

        setProgress(0);
        setCleaningInProgress(true);
        setErrorMessage(null);

        try {
            let totalSteps = Object.keys(missingValues).length;
            let currentStep = 0;

            let currentData = cleanedData && cleanedData.headers.length > 0
                ? { ...cleanedData }
                : { headers: [...rawFileData.headers], rows: [...rawFileData.rows] };

            for (const column of Object.keys(missingValues)) {
                currentStep++;
                setProgress(Math.round((currentStep / totalSteps) * 100));

                const columnSetting = missingValues[column];

                // Use the store's handleOperation
                const result = await handleOperation("missing", {
                    data: currentData,
                    column,
                    strategy: columnSetting.strategy,
                    value: columnSetting.value
                });

                if (result) {
                    currentData = result;
                }
            }

            updateCleanedData(currentData);

            toast({
                title: "缺失值处理完成",
                description: "已成功完成所有缺失值处理操作",
            });

            setCleaningComplete(true);
            setCleaningInProgress(false);
            setProgress(100);
        } catch (error) {
            console.error("Error processing missing values:", error);
            setErrorMessage(`处理缺失值时出错: ${error}`);
            setCleaningInProgress(false);
        }
    };

    // Handle outliers processing
    const handleOutliers = async () => {
        if (!file || !rawFileData || Object.keys(outlierSettings).length === 0) return;

        setProgress(0);
        setCleaningInProgress(true);
        setErrorMessage(null);

        try {
            let totalSteps = Object.keys(outlierSettings).length;
            let currentStep = 0;

            let currentData = cleanedData && cleanedData.headers.length > 0
                ? { ...cleanedData }
                : { headers: [...rawFileData.headers], rows: [...rawFileData.rows] };

            for (const column of Object.keys(outlierSettings)) {
                currentStep++;
                setProgress(Math.round((currentStep / totalSteps) * 100));

                const settings = outlierSettings[column];

                // Use the store's handleOperation
                const result = await handleOperation("outliers", {
                    data: currentData,
                    column,
                    ...settings
                });

                if (result) {
                    currentData = result;
                }
            }

            updateCleanedData(currentData);

            toast({
                title: "异常值处理完成",
                description: "已成功完成所有异常值处理操作",
            });

            setCleaningComplete(true);
            setCleaningInProgress(false);
            setProgress(100);
        } catch (error) {
            console.error("Error processing outliers:", error);
            setErrorMessage(`处理异常值时出错: ${error}`);
            setCleaningInProgress(false);
        }
    };

    // Handle duplicates processing
    const handleDuplicates = async () => {
        if (
            !file ||
            !rawFileData ||
            !duplicateSettings ||
            duplicateSettings.columnsToCheck.length === 0
        )
            return;

        setProgress(0);
        setCleaningInProgress(true);
        setErrorMessage(null);

        try {
            let currentData = cleanedData && cleanedData.headers.length > 0
                ? { ...cleanedData }
                : { headers: [...rawFileData.headers], rows: [...rawFileData.rows] };

            setProgress(50); // Set to 50% as this is typically a single operation

            // Use the store's handleOperation
            const result = await handleOperation("duplicates", {
                data: currentData,
                columnsToCheck: duplicateSettings.columnsToCheck,
                strategy: duplicateSettings.strategy
            });

            if (result) {
                updateCleanedData(result);
            }

            toast({
                title: "重复值处理完成",
                description: "已成功完成重复值处理操作",
            });

            setCleaningComplete(true);
            setCleaningInProgress(false);
            setProgress(100);
        } catch (error) {
            console.error("Error processing duplicates:", error);
            setErrorMessage(`处理重复值时出错: ${error}`);
            setCleaningInProgress(false);
        }
    };

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

    // Determine which cleaning function to call based on active tab
    const handleProcessing = () => {
        switch (activeTab) {
            case "missing":
                handleMissingValues();
                break;
            case "outliers":
                handleOutliers();
                break;
            case "duplicates":
                handleDuplicates();
                break;
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
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">数据清洗</CardTitle>
                    <CardDescription>
                        通过处理缺失值、异常值和重复值来清洗数据
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                        file={file}
                                        columns={availableColumns}
                                        onSettingsChange={setMissingValues}
                                        rawData={rawFileData}
                                    />
                                </TabsContent>

                                <TabsContent value="outliers" className="mt-4">
                                    <OutliersTab
                                        file={file}
                                        columns={availableColumns}
                                        onSettingsChange={setOutlierSettings}
                                        rawData={rawFileData}
                                    />
                                </TabsContent>

                                <TabsContent value="duplicates" className="mt-4">
                                    <DuplicatesTab
                                        file={file}
                                        columns={availableColumns}
                                        onSettingsChange={setDuplicateSettings}
                                        rawData={rawFileData}
                                    />
                                </TabsContent>

                                <div className="flex justify-between mt-6">
                                    <Button
                                        variant="default"
                                        onClick={handleProcessing}
                                        disabled={
                                            cleaningInProgress ||
                                            (activeTab === "missing" &&
                                                Object.keys(missingValues).length === 0) ||
                                            (activeTab === "outliers" &&
                                                Object.keys(outlierSettings).length === 0) ||
                                            (activeTab === "duplicates" &&
                                                duplicateSettings.columnsToCheck.length === 0)
                                        }
                                    >
                                        {cleaningComplete ? (
                                            <>
                                                <CheckIcon className="mr-2 h-4 w-4" />
                                                完成
                                            </>
                                        ) : (
                                            "处理数据"
                                        )}
                                    </Button>

                                    {cleanedData && cleanedData.headers.length > 0 && (
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
                </CardContent>
            </Card>
        </div>
    );
} 