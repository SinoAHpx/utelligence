"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import ChartRenderer from "./charts/chart-renderer";
import AddChartModal from "./components/add-chart-modal";

/**
 * Props for the DataDisplay component
 */
interface DataDisplayProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
  onColumnSelectionChange?: (columns: string[]) => void;
}

/**
 * 数据可视化显示组件
 * 负责处理数据文件(CSV/Excel)并显示可视化图表
 */
export default function DataDisplay({
  file,
  selectedColumns,
}: DataDisplayProps) {
  // Get state from Zustand store
  const {
    userCharts,
    removeChart,
    setSelectedChartType,
    setSelectedColumnsForChart,
    setChartTitle,
    setXAxisColumn,
    setYAxisColumns,
    processedFile,
    isFileLoading,
    fileError,
    processAndAnalyzeFile,
    setRawFileData,
    setProcessedFile,
    setColumnsVisualizableStatus,
  } = useDataVisualizationStore();

  // Local state only for modal open/close
  const [addChartModalOpen, setAddChartModalOpen] = useState<boolean>(false);

  // Simplified useEffect to trigger file processing via store action
  useEffect(() => {
    if (file) {
      // Check if the file needs processing (based on processedFile state)
      const fileSignature = `${file.name}-${file.size}`;
      const processedSignature = processedFile
        ? `${processedFile.name}-${processedFile.size}`
        : "";

      if (fileSignature !== processedSignature) {
        // Call the store action to handle processing and analysis
        // We pass `selectedColumns` here to tell the action *which* columns to analyze
        processAndAnalyzeFile(file, selectedColumns);
      }
    } else {
      // Clear relevant state if file is removed
      setRawFileData(null);
      setProcessedFile(null);
      setColumnsVisualizableStatus([]);
      // Optionally reset chart creation state too?
    }
    // Dependency array: re-run if the file object changes or the list of selected columns changes
  }, [file, selectedColumns, processedFile, processAndAnalyzeFile, setRawFileData, setProcessedFile, setColumnsVisualizableStatus]);

  // 打开添加图表对话框
  const openAddChartModal = () => {
    // Check for fileError from the store instead of rawFileData presence
    if (fileError) {
      // Maybe show a toast or keep the error message displayed?
      console.error("Cannot open add chart modal due to file error:", fileError);
      return; // Prevent opening modal if there's a file error
    }
    if (isFileLoading) {
      console.warn("Data is still loading, please wait.");
      // Optionally disable the add button while loading
      return;
    }

    setAddChartModalOpen(true);
    // Reset temporary chart config state in the store when modal opens
    setSelectedColumnsForChart([]);
    setSelectedChartType("bar");
    setChartTitle("");
    setXAxisColumn("");
    // Reset yAxisColumns to an empty array
    setYAxisColumns([]);
    // No need to call checkColumnsVisualizable here, status is updated by the store action
  };

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
        {/* Optionally add a button to clear the error or re-upload */}
      </div>
    );
  }

  if (selectedColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          请在文件预览选项卡中选择至少一列数据进行可视化
        </p>
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
              <p className="text-xs text-muted-foreground">
                已选择 {selectedColumns.length} 列数据:{" "}
                {selectedColumns.join(", ")}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.dispatchEvent(new Event("visualize"))}
            >
              重新选择列
            </Button>
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
        availableColumns={selectedColumns}
      />
    </div>
  );
}
