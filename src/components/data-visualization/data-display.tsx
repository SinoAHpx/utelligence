"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { ColumnVisualizableConfig } from "@/store/dataVisualizationStore";
import { ChartDataItem, CHART_TYPES } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";
import { processFileData, CellValue, FileRow, FileData, analyzeColumnData } from "@/utils/data-processing";
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
  availableColumns,
  onColumnSelectionChange,
}: DataDisplayProps) {
  // Get state from Zustand store
  const {
    chartData,
    setChartData,
    userCharts,
    addChart,
    removeChart,
    selectedChartType,
    setSelectedChartType,
    selectedColumnsForChart,
    setSelectedColumnsForChart,
    chartTitle,
    setChartTitle,
    xAxisColumn,
    setXAxisColumn,
    yAxisColumn,
    setYAxisColumn,
    processedFile,
    setProcessedFile,
    columnsVisualizableStatus,
    setColumnsVisualizableStatus
  } = useDataVisualizationStore();

  // Local state
  const [loading, setLoading] = useState<boolean>(false);
  const [addChartModalOpen, setAddChartModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 当选择的文件改变时处理数据
  useEffect(() => {
    if (file && selectedColumns.length > 0) {
      // 检查文件是否已经处理过
      const fileSignature = `${file.name}-${file.size}`;
      const processedSignature = processedFile
        ? `${processedFile.name}-${processedFile.size}`
        : "";

      if (fileSignature !== processedSignature) {
        setProcessedFile({ name: file.name, size: file.size });
        setLoading(true);
        setError(null);

        // Use the shared processFileData utility
        processFileData(
          file,
          selectedColumns,
          (chartData) => {
            setChartData(chartData);
            setLoading(false);
          },
          (errorMsg) => {
            setError(errorMsg);
            setLoading(false);
          }
        );
      }
    }
  }, [file, selectedColumns, processedFile, setProcessedFile, setChartData]);

  /**
   * 检查列是否适合可视化
   * 分析数据分布特征，确定列是否适合可视化
   */
  const checkColumnsVisualizable = React.useCallback(async () => {
    if (!file || selectedColumns.length === 0) return;

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const newStatus: ColumnVisualizableConfig[] = [];

      if (fileExtension === "csv") {
        const text = await file.text();
        const result = Papa.parse(text);
        const headers = result.data[0] as string[];
        const rows = result.data.slice(1) as string[][];

        analyzeColumnsForVisualization(headers, rows, newStatus);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as FileData;

        analyzeColumnsForVisualization(headers, rows, newStatus);
      }
    } catch (err) {
      console.error("分析列可视化状态失败:", err);
    }
  }, [file, selectedColumns, setColumnsVisualizableStatus]);

  /**
   * 分析列数据分布特征
   */
  const analyzeColumnsForVisualization = (headers: string[], rows: any[], newStatus: ColumnVisualizableConfig[]) => {
    // 分析每一列
    for (const colName of selectedColumns) {
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) continue;

      // 提取该列所有值
      const columnData = rows.map(row => row[colIndex]).filter(v => v !== undefined && v !== null && v !== "");

      // Use the shared analyzeColumnData utility
      const analysis = analyzeColumnData(columnData);

      newStatus.push({
        column: colName,
        isVisualizable: analysis.isValidForVisualization,
        uniqueValues: analysis.uniqueValues,
        totalValues: columnData.length,
        reason: !analysis.isValidForVisualization
          ? analysis.uniqueValues <= 1
            ? "数据值过少，不适合可视化"
            : "唯一值占比过高，不适合可视化"
          : undefined
      });
    }

    setColumnsVisualizableStatus(newStatus);
  };

  // 打开添加图表对话框
  const openAddChartModal = () => {
    setAddChartModalOpen(true);
    setSelectedColumnsForChart([]);
    setSelectedChartType("bar");
    setChartTitle("");
    setXAxisColumn("");
    setYAxisColumn("");
    // 检查列是否可视化
    checkColumnsVisualizable();
  };

  // Render loading and error states
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (selectedColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          请在文件预览选项卡中选择至少一列数据
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
                  chartData={chartData}
                  onRemoveChart={removeChart}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
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
        onCheckColumnsVisualizable={checkColumnsVisualizable}
      />
    </div>
  );
}
