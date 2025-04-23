import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download } from "lucide-react";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DataCleaningProps, OutlierStats, DuplicateStats } from "./types";
import { MissingValuesTab } from "./MissingValuesTab";
import { OutliersTab } from "./OutliersTab";
import { DuplicatesTab } from "./DuplicatesTab";
import { TransformTab } from "./TransformTab";

export default function DataCleaning({
    file,
    selectedColumns,
    availableColumns,
}: DataCleaningProps) {
    const [activeTab, setActiveTab] = useState<string>("missing");
    const [isCleaning, setIsCleaning] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [selectedColumn, setSelectedColumn] = useState<string>("");
    const [missingOption, setMissingOption] = useState<string>("remove-rows");
    const [customValue, setCustomValue] = useState<string>("");
    const [outlierOption, setOutlierOption] = useState<string>("remove-outliers");
    const [detectionMethod, setDetectionMethod] = useState<string>("zscore");
    const [threshold, setThreshold] = useState<number>(3);
    const [cleaned, setCleaned] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
    const [outlierStats, setOutlierStats] = useState<OutlierStats>({
        count: 0,
        lowerBound: 0,
        upperBound: 0,
        method: "",
        threshold: 0,
        hasRun: false
    });
    const [duplicateOption, setDuplicateOption] = useState<string>("remove-duplicates");
    const [keepStrategy, setKeepStrategy] = useState<string>("first");
    const [duplicateColumnsSelection, setDuplicateColumnsSelection] = useState<string[]>([]);
    const [duplicateStats, setDuplicateStats] = useState<DuplicateStats>({
        totalRows: 0,
        uniqueRows: 0,
        duplicateRows: 0,
        duplicateGroupsCount: 0,
        duplicateCount: 0,
        hasRun: false
    });
    const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
    const [showDuplicatesVisualization, setShowDuplicatesVisualization] = useState<boolean>(false);

    const { toast } = useToast();
    const downloadLinkRef = useRef<HTMLAnchorElement>(null);
    const { rawFileData, processAndAnalyzeFile } = useDataVisualizationStore();
    const [outlierData, setOutlierData] = useState<any[]>([]);
    const [showVisualization, setShowVisualization] = useState<boolean>(false);

    // 调试: 记录rawFileData的状态
    useEffect(() => {
        console.log("DataCleaning: rawFileData changed:", rawFileData);
    }, [rawFileData]);

    // 确保文件数据已加载
    useEffect(() => {
        if (file && (!rawFileData || rawFileData.headers.length === 0)) {
            console.log("DataCleaning: 需要加载文件数据，正在处理...");
            // 确保文件数据已加载
            processAndAnalyzeFile(file, availableColumns).then(() => {
                console.log("DataCleaning: 文件数据处理完成");
            }).catch((error) => {
                console.error("DataCleaning: 处理文件数据时出错:", error);
                toast({
                    title: "文件处理错误",
                    description: "无法处理文件数据，请尝试重新上传文件",
                    variant: "destructive",
                });
            });
        }
    }, [file, rawFileData, availableColumns, processAndAnalyzeFile, toast]);

    const tabItems = [
        { id: "missing", name: "缺失值处理" },
        { id: "outliers", name: "异常值处理" },
        { id: "duplicates", name: "重复数据" },
        { id: "transform", name: "数据转换" },
    ];

    // When column selection changes, update the selected column
    React.useEffect(() => {
        if (selectedColumns.length > 0 && !selectedColumn) {
            setSelectedColumn(selectedColumns[0]);
        }
    }, [selectedColumns, selectedColumn]);

    // Reset outlier stats when tab, method, or threshold changes
    React.useEffect(() => {
        if (outlierStats.hasRun) {
            setOutlierStats({
                count: 0,
                lowerBound: 0,
                upperBound: 0,
                method: "",
                threshold: 0,
                hasRun: false
            });
            setShowVisualization(false);
        }
    }, [activeTab, detectionMethod, threshold, selectedColumn]);

    // Reset duplicate stats when tab or column selection changes
    React.useEffect(() => {
        if (duplicateStats.hasRun) {
            setDuplicateStats({
                totalRows: 0,
                uniqueRows: 0,
                duplicateRows: 0,
                duplicateGroupsCount: 0,
                duplicateCount: 0,
                hasRun: false
            });
            setShowDuplicatesVisualization(false);
        }
    }, [activeTab, duplicateColumnsSelection]);

    const handleClean = async () => {
        if (!file) {
            toast({
                title: "错误",
                description: "请上传文件",
                variant: "destructive",
            });
            return;
        }

        if (activeTab === "missing" && !selectedColumn) {
            toast({
                title: "错误",
                description: "请选择要处理的列",
                variant: "destructive",
            });
            return;
        }

        if (activeTab === "duplicates" && duplicateColumnsSelection.length === 0) {
            toast({
                title: "错误",
                description: "请至少选择一列用于重复数据检测",
                variant: "destructive",
            });
            return;
        }

        setIsCleaning(true);
        setMessage("");
        setCleaned(false);
        setProcessedFileUrl(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            let endpoint = "";

            if (activeTab === "missing") {
                endpoint = "/api/data/missing";
                formData.append("columnName", selectedColumn);
                formData.append("operation", missingOption);
                if (missingOption === "fill-custom") {
                    formData.append("customValue", customValue);
                }
            } else if (activeTab === "outliers") {
                endpoint = "/api/data/outliers";
                formData.append("columnName", selectedColumn);
                formData.append("operation", outlierOption);
                formData.append("method", detectionMethod);
                formData.append("threshold", threshold.toString());
            } else if (activeTab === "duplicates") {
                endpoint = "/api/data/duplicates";
                formData.append("columns", JSON.stringify(duplicateColumnsSelection));
                formData.append("operation", duplicateOption);
                formData.append("keepStrategy", keepStrategy);
            } else {
                throw new Error("未实现的数据清洗选项");
            }

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "数据处理失败");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setProcessedFileUrl(url);
            setCleaned(true);
            setMessage("数据处理完成，您可以下载处理后的文件。");

        } catch (error) {
            console.error("数据清洗错误:", error);
            toast({
                title: "处理错误",
                description: error instanceof Error ? error.message : "数据处理时出错",
                variant: "destructive",
            });
        } finally {
            setIsCleaning(false);
        }
    };

    const handleExport = () => {
        if (processedFileUrl && downloadLinkRef.current) {
            setIsExporting(true);

            // Use a timeout to show the exporting state
            setTimeout(() => {
                if (downloadLinkRef.current) {
                    downloadLinkRef.current.click();
                    setIsExporting(false);
                }
            }, 500);
        }
    };

    if (!file) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
            </div>
        );
    }

    if (selectedColumns.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                    请先在文件预览选项卡中选择至少一列数据
                </p>
            </div>
        );
    }

    // 如果文件数据还未加载完成，显示加载中提示
    if (!rawFileData) {
        return (
            <div className="w-full space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-gray-500 dark:text-gray-400">正在加载文件数据，请稍候...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        文件: <span className="font-bold">{file.name}</span>
                    </h3>
                    <div className="flex space-x-2">
                        <Button
                            onClick={handleClean}
                            disabled={isCleaning || !selectedColumn || !rawFileData}
                            variant="default"
                        >
                            {isCleaning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    处理中...
                                </>
                            ) : (
                                <>执行清洗</>
                            )}
                        </Button>

                        {processedFileUrl && (
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary/10"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        导出中...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        导出文件
                                    </>
                                )}
                            </Button>
                        )}
                        <a
                            ref={downloadLinkRef}
                            href={processedFileUrl || "#"}
                            download={`cleaned_${file.name}`}
                            className="hidden"
                        >
                            下载
                        </a>
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="column-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        选择要处理的列:
                    </Label>
                    <Select
                        value={selectedColumn}
                        onValueChange={setSelectedColumn}
                    >
                        <SelectTrigger id="column-select" className="w-full">
                            <SelectValue placeholder="请选择列" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedColumns.map((col) => (
                                <SelectItem key={col} value={col}>
                                    {col}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {message && (
                    <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-md">
                        {message}
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 mb-4">
                        {tabItems.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="missing" className="mt-4">
                        <MissingValuesTab
                            file={file}
                            selectedColumn={selectedColumn}
                            selectedColumns={selectedColumns}
                            availableColumns={availableColumns}
                            setMessage={setMessage}
                            setProcessedFileUrl={setProcessedFileUrl}
                            setCleaned={setCleaned}
                            rawFileData={rawFileData}
                            missingOption={missingOption}
                            setMissingOption={setMissingOption}
                            customValue={customValue}
                            setCustomValue={setCustomValue}
                        />
                    </TabsContent>

                    <TabsContent value="outliers" className="mt-4">
                        <OutliersTab
                            file={file}
                            selectedColumn={selectedColumn}
                            selectedColumns={selectedColumns}
                            availableColumns={availableColumns}
                            setMessage={setMessage}
                            setProcessedFileUrl={setProcessedFileUrl}
                            setCleaned={setCleaned}
                            rawFileData={rawFileData}
                            outlierOption={outlierOption}
                            setOutlierOption={setOutlierOption}
                            detectionMethod={detectionMethod}
                            setDetectionMethod={setDetectionMethod}
                            threshold={threshold}
                            setThreshold={setThreshold}
                            outlierStats={outlierStats}
                            setOutlierStats={setOutlierStats}
                            showVisualization={showVisualization}
                            setShowVisualization={setShowVisualization}
                            outlierData={outlierData}
                            setOutlierData={setOutlierData}
                        />
                    </TabsContent>

                    <TabsContent value="duplicates" className="mt-4">
                        <DuplicatesTab
                            file={file}
                            selectedColumn={selectedColumn}
                            selectedColumns={selectedColumns}
                            availableColumns={availableColumns}
                            setMessage={setMessage}
                            setProcessedFileUrl={setProcessedFileUrl}
                            setCleaned={setCleaned}
                            rawFileData={rawFileData}
                            duplicateOption={duplicateOption}
                            setDuplicateOption={setDuplicateOption}
                            keepStrategy={keepStrategy}
                            setKeepStrategy={setKeepStrategy}
                            duplicateColumnsSelection={duplicateColumnsSelection}
                            setDuplicateColumnsSelection={setDuplicateColumnsSelection}
                            duplicateStats={duplicateStats}
                            setDuplicateStats={setDuplicateStats}
                            duplicateGroups={duplicateGroups}
                            setDuplicateGroups={setDuplicateGroups}
                            showDuplicatesVisualization={showDuplicatesVisualization}
                            setShowDuplicatesVisualization={setShowDuplicatesVisualization}
                        />
                    </TabsContent>

                    <TabsContent value="transform" className="mt-4">
                        <TransformTab
                            file={file}
                            selectedColumn={selectedColumn}
                            selectedColumns={selectedColumns}
                            availableColumns={availableColumns}
                            setMessage={setMessage}
                            setProcessedFileUrl={setProcessedFileUrl}
                            setCleaned={setCleaned}
                            rawFileData={rawFileData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 