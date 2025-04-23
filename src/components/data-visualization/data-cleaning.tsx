"use client";

import React, { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, ArrowRight, InfoIcon, Eye } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { mean, standardDeviation } from "@/utils/statistics";
import OutliersVisualization from "./outliers-visualization";

interface DataCleaningProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

interface OutlierStats {
  count: number;
  lowerBound: number;
  upperBound: number;
  method: string;
  threshold: number;
  hasRun: boolean;
}

export default function DataCleaning({
  file,
  selectedColumns,
  availableColumns,
}: DataCleaningProps) {
  const [activeTab, setActiveTab] = useState<string>("missing");
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
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
  const { toast } = useToast();
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const { rawFileData } = useDataVisualizationStore();
  const [outlierData, setOutlierData] = useState<any[]>([]);
  const [showVisualization, setShowVisualization] = useState<boolean>(false);

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

  const analyzeOutliers = async () => {
    if (!rawFileData || !selectedColumn) {
      toast({
        title: "错误",
        description: "无法分析数据，请确保已选择列",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const columnIndex = rawFileData.headers.indexOf(selectedColumn);
      if (columnIndex === -1) {
        throw new Error(`找不到列: ${selectedColumn}`);
      }

      // Extract numeric values
      const values = rawFileData.rows
        .map(row => row[columnIndex])
        .filter(value => value !== null && value !== undefined && String(value).trim() !== "")
        .map(value => typeof value === "number" ? value : Number(value))
        .filter(value => !isNaN(value));

      if (values.length === 0) {
        throw new Error("所选列中没有数值数据");
      }

      let outlierCount = 0;
      let lowerBound = 0;
      let upperBound = 0;

      if (detectionMethod === "zscore") {
        const meanValue = mean(values) || 0;
        const stdDev = standardDeviation(values) || 1;

        lowerBound = meanValue - threshold * stdDev;
        upperBound = meanValue + threshold * stdDev;

        outlierCount = values.filter(value =>
          Math.abs((value - meanValue) / stdDev) > threshold
        ).length;
      }
      else if (detectionMethod === "iqr") {
        const sortedValues = [...values].sort((a, b) => a - b);
        const q1Index = Math.floor(sortedValues.length * 0.25);
        const q3Index = Math.floor(sortedValues.length * 0.75);

        const q1 = sortedValues[q1Index];
        const q3 = sortedValues[q3Index];
        const iqr = q3 - q1;

        lowerBound = q1 - threshold * iqr;
        upperBound = q3 + threshold * iqr;

        outlierCount = values.filter(value =>
          value < lowerBound || value > upperBound
        ).length;
      }
      else if (detectionMethod === "percentile") {
        const sortedValues = [...values].sort((a, b) => a - b);
        const lowerIndex = Math.max(0, Math.floor(sortedValues.length * (threshold / 100)));
        const upperIndex = Math.min(sortedValues.length - 1, Math.floor(sortedValues.length * ((100 - threshold) / 100)));

        lowerBound = sortedValues[lowerIndex];
        upperBound = sortedValues[upperIndex];

        outlierCount = values.filter(value =>
          value < lowerBound || value > upperBound
        ).length;
      }

      setOutlierStats({
        count: outlierCount,
        lowerBound: parseFloat(lowerBound.toFixed(2)),
        upperBound: parseFloat(upperBound.toFixed(2)),
        method: detectionMethod,
        threshold,
        hasRun: true
      });

      // 为可视化准备数据
      if (rawFileData) {
        const columnIndex = rawFileData.headers.indexOf(selectedColumn);
        if (columnIndex !== -1) {
          const preparedData = rawFileData.rows.map((row, idx) => {
            const rowData: Record<string, any> = { _index: idx };
            rawFileData.headers.forEach((header, i) => {
              rowData[header] = row[i];
            });
            return rowData;
          });
          setOutlierData(preparedData);
        }
      }

    } catch (error) {
      console.error("分析异常值时出错:", error);
      toast({
        title: "分析错误",
        description: error instanceof Error ? error.message : "分析异常值时出错",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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

      // Update the message based on the active tab
      if (activeTab === "outliers" && outlierStats.hasRun) {
        setMessage(`数据清洗完成，已${outlierOption === "remove-outliers" ? "移除" : "截断"}${outlierStats.count}个异常值。可以下载处理后的文件。`);
      } else {
        setMessage("数据清洗完成，可以下载处理后的文件");
      }

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

  // 查看异常值详情
  const viewOutlierDetails = () => {
    setShowVisualization(true);
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
            <div className="space-y-6">
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
                    <Label htmlFor="cap-outliers">截断异常值（使用边界值替换）</Label>
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

                  <div className="text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">方法说明：</p>
                    {detectionMethod === "zscore" && (
                      <>
                        <p className="mb-1"><span className="font-medium">Z-Score</span>：基于均值和标准差检测异常值。适用于呈正态分布的数据。</p>
                        <p>计算方式：<code>|x - 均值| / 标准差 &gt; 阈值</code>，默认阈值为3，表示超出3个标准差的值被视为异常值。</p>
                      </>
                    )}
                    {detectionMethod === "iqr" && (
                      <>
                        <p className="mb-1"><span className="font-medium">IQR (四分位距)</span>：基于四分位数范围检测异常值。不受极端值影响，适用于偏斜分布数据。</p>
                        <p>计算方式：异常值为小于 <code>Q1 - 阈值×IQR</code> 或大于 <code>Q3 + 阈值×IQR</code> 的值，其中 IQR = Q3 - Q1。</p>
                      </>
                    )}
                    {detectionMethod === "percentile" && (
                      <>
                        <p className="mb-1"><span className="font-medium">百分位数</span>：使用百分位数确定异常值边界。适合需要去除特定比例极端值的场景。</p>
                        <p>计算方式：将低于第<code>N</code>百分位或高于第<code>100-N</code>百分位的值视为异常值，<code>N</code>为设定的阈值。</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeOutliers}
                    disabled={isAnalyzing || !selectedColumn}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>分析异常值</>
                    )}
                  </Button>
                </div>
              </div>

              {outlierStats.hasRun && (
                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center mb-2">
                      <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                      <h4 className="text-sm font-medium">异常值分析结果</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">检测方法:</p>
                        <p className="font-medium">
                          {outlierStats.method === "zscore" && "Z-Score"}
                          {outlierStats.method === "iqr" && "IQR (四分位数)"}
                          {outlierStats.method === "percentile" && "百分位数"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">检测到的异常值数量:</p>
                        <p className="font-medium">{outlierStats.count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">下边界:</p>
                        <p className="font-medium">{outlierStats.lowerBound}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">上边界:</p>
                        <p className="font-medium">{outlierStats.upperBound}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {outlierOption === "remove-outliers"
                        ? `将移除${outlierStats.count}个超出边界的数据行`
                        : `将使用边界值替换${outlierStats.count}个异常值`}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={viewOutlierDetails}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {showVisualization && outlierStats.hasRun && outlierData.length > 0 && (
              <OutliersVisualization
                data={outlierData}
                columnName={selectedColumn}
                method={outlierStats.method}
                threshold={outlierStats.threshold}
                statistics={{
                  lowerBound: outlierStats.lowerBound,
                  upperBound: outlierStats.upperBound,
                  method: outlierStats.method,
                  threshold: outlierStats.threshold,
                  outlierCount: outlierStats.count,
                  totalCount: outlierData.length,
                  methodDetails: {
                    ...(outlierStats.method === "zscore" && rawFileData ? {
                      mean: mean(rawFileData.rows
                        .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                        .filter(v => v !== null && v !== undefined)
                        .map(v => Number(v))
                        .filter(v => !isNaN(v))),
                      stdDev: standardDeviation(rawFileData.rows
                        .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                        .filter(v => v !== null && v !== undefined)
                        .map(v => Number(v))
                        .filter(v => !isNaN(v)))
                    } : {}),
                    ...(outlierStats.method === "iqr" && rawFileData ? (() => {
                      const values = rawFileData.rows
                        .map(row => row[rawFileData.headers.indexOf(selectedColumn)])
                        .filter(v => v !== null && v !== undefined)
                        .map(v => Number(v))
                        .filter(v => !isNaN(v))
                        .sort((a, b) => a - b);
                      const q1Index = Math.floor(values.length * 0.25);
                      const q3Index = Math.floor(values.length * 0.75);
                      const q1 = values[q1Index];
                      const q3 = values[q3Index];
                      return {
                        q1,
                        q3,
                        iqr: q3 - q1
                      };
                    })() : {}),
                    ...(outlierStats.method === "percentile" ? {
                      lowerPercentile: threshold,
                      upperPercentile: 100 - threshold
                    } : {})
                  }
                }}
              />
            )}
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
