"use client";

import React, { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, ArrowRight } from "lucide-react";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DataCleaningProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

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
  const { toast } = useToast();
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

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

  const handleClean = async () => {
    if (!file || !selectedColumn) {
      toast({
        title: "错误",
        description: "请选择要处理的列",
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
      formData.append("columnName", selectedColumn);

      let endpoint = "";

      if (activeTab === "missing") {
        endpoint = "/api/data/missing";
        formData.append("operation", missingOption);
        if (missingOption === "fill-custom") {
          formData.append("customValue", customValue);
        }
      } else if (activeTab === "outliers") {
        endpoint = "/api/data/outliers";
        formData.append("operation", outlierOption);
        formData.append("method", detectionMethod);
        formData.append("threshold", threshold.toString());
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

      // Create a blob URL for downloading
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedFileUrl(url);
      setCleaned(true);
      setMessage("数据清洗完成，可以下载处理后的文件");

    } catch (error) {
      console.error("数据清洗错误:", error);
      setMessage(error instanceof Error ? error.message : "处理数据时出错");
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "处理数据时出错",
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
              disabled={isCleaning || !selectedColumn}
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
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                缺失值处理选项
              </h4>

              <RadioGroup
                value={missingOption}
                onValueChange={setMissingOption}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove-rows" id="remove-rows" />
                  <Label htmlFor="remove-rows">删除包含缺失值的行</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fill-mean" id="fill-mean" />
                  <Label htmlFor="fill-mean">使用均值填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fill-median" id="fill-median" />
                  <Label htmlFor="fill-median">使用中位数填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fill-mode" id="fill-mode" />
                  <Label htmlFor="fill-mode">使用众数填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fill-custom" id="fill-custom" />
                  <Label htmlFor="fill-custom">使用自定义值填充</Label>
                  <Input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="ml-2 w-40"
                    placeholder="自定义值"
                    disabled={missingOption !== "fill-custom"}
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="outliers" className="mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                异常值处理选项
              </h4>

              <RadioGroup
                value={outlierOption}
                onValueChange={setOutlierOption}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove-outliers" id="remove-outliers" />
                  <Label htmlFor="remove-outliers">移除异常值</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cap-outliers" id="cap-outliers" />
                  <Label htmlFor="cap-outliers">截断异常值（使用分位数）</Label>
                </div>
              </RadioGroup>

              <div className="pt-4 space-y-4">
                <div className="flex items-center">
                  <Label className="mr-3 w-20">检测方法:</Label>
                  <Select
                    value={detectionMethod}
                    onValueChange={setDetectionMethod}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zscore">Z-Score</SelectItem>
                      <SelectItem value="iqr">IQR（四分位数）</SelectItem>
                      <SelectItem value="percentile">百分位数</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center">
                  <Label className="mr-3 w-20">阈值:</Label>
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    min={0}
                    step={detectionMethod === "percentile" ? 1 : 0.1}
                    max={detectionMethod === "percentile" ? 50 : 10}
                    className="w-20"
                  />
                  <span className="ml-2 text-xs text-gray-500">
                    {detectionMethod === "zscore" && "标准差倍数"}
                    {detectionMethod === "iqr" && "IQR倍数"}
                    {detectionMethod === "percentile" && "百分位（1-50）"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="duplicates" className="mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                重复数据处理选项
              </h4>

              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 dark:text-gray-400">
                  功能开发中，敬请期待...
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transform" className="mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                数据转换选项
              </h4>

              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 dark:text-gray-400">
                  功能开发中，敬请期待...
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
