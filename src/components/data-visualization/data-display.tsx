"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { useFileUploadStore } from "@/store/fileUploadStore";
import ChartRenderer from "./charts/chart-renderer";
import AddChartModal from "../ui/data/add-chart-modal";
import { Badge } from "../ui/shadcn/badge";

/**
 * 数据可视化显示组件
 * 负责处理数据文件(CSV/Excel)并显示可视化图表
 */
export default function DataDisplay() {
  // Get file and parsed data from FilePreviewStore
  const { file, parsedData } = useFileUploadStore();

  // Get state from Zustand store
  const {
    userCharts,
    removeChart,
    setSelectedChartType,
    setSelectedColumnsForChart,
    setChartTitle,
    setXAxisColumn,
    setYAxisColumn,
    currentFileIdentifier,
    isFileLoading,
    fileError,
    processAndAnalyzeFile,
    setRawFileData,
    setCurrentFileIdentifier,
    setColumnsVisualizableStatus
  } = useDataVisualizationStore();

  // Local state only for modal open/close
  const [addChartModalOpen, setAddChartModalOpen] = useState<boolean>(false);

  // Simplified useEffect to trigger file processing via store action
  useEffect(() => {
    if (file) {
      // Check if the file needs processing (based on currentFileIdentifier state)
      const fileSignature = `${file.name}-${file.size}`;

      if (fileSignature !== currentFileIdentifier) {
        // Process all columns for visualization and analysis
        const allColumns = parsedData?.headers || [];
        processAndAnalyzeFile(file, allColumns);
      }
    } else {
      // Clear relevant state if file is removed
      setRawFileData(null);
      setCurrentFileIdentifier(null);
      setColumnsVisualizableStatus([]);
    }
  }, [file, parsedData, currentFileIdentifier, processAndAnalyzeFile, setRawFileData, setCurrentFileIdentifier, setColumnsVisualizableStatus]);

  // 打开添加图表对话框
  const openAddChartModal = () => {
    // Check for fileError from the store instead of rawFileData presence
    if (fileError) {
      console.error("Cannot open add chart modal due to file error:", fileError);
      return; // Prevent opening modal if there's a file error
    }
    if (isFileLoading) {
      console.warn("Data is still loading, please wait.");
      return;
    }

    setAddChartModalOpen(true);
    // Reset temporary chart config state in the store when modal opens
    setSelectedColumnsForChart([]);
    setSelectedChartType("bar");
    setChartTitle("");
    setXAxisColumn("");
    // Reset yAxisColumn to empty string
    setYAxisColumn("");
  };

  // Get all available columns from the raw file data
  const allColumns = parsedData?.headers || [];

  // Render loading and error states based on store state
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  if (isFileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">正在处理文件...</p>
      </div>
    );
  }

  if (fileError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 dark:text-red-400 mb-4">文件处理失败:</p>
        <p className="text-red-400 dark:text-red-300 text-sm bg-red-900/20 p-2 rounded">{fileError}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium mb-2">
                数据可视化总览
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                可用列数: {allColumns.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {allColumns.map((col) => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {userCharts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 p-6">
            <p className="text-muted-foreground mb-6 text-center">
              您尚未创建任何数据可视化图表。<br />
              点击下方按钮，选择需要可视化的列和图表类型。
            </p>
            <Button
              onClick={openAddChartModal}
              className="flex items-center gap-2"
              disabled={isFileLoading || !!fileError}
            >
              <PlusCircle size={16} />
              <span>添加可视化图表</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={openAddChartModal}
              variant="default"
              className="flex items-center gap-2"
              size="sm"
              disabled={isFileLoading || !!fileError}
            >
              <PlusCircle size={16} />
              <span>添加图表</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCharts.map((chart) => (
              <div key={chart.id} className="relative">
                <ChartRenderer
                  chartConfig={chart}
                  onRemoveChart={removeChart}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeChart(chart.id)}
                  aria-label="删除图表"
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 添加图表对话框 */}
      <AddChartModal
        open={addChartModalOpen}
        onOpenChange={setAddChartModalOpen}
        allColumns={allColumns}
      />
    </div>
  );
}
