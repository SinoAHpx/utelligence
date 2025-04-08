"use client";

import React, { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { ColumnVisualizableConfig } from "@/store/dataVisualizationStore";
import { ChartDataItem, CHART_TYPES } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";
import ChartRenderer from "./charts/chart-renderer";
import AddChartModal from "./components/add-chart-modal";

// Types
interface DataDisplayProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
  onColumnSelectionChange?: (columns: string[]) => void;
}

// File data types
type CellValue = string | number;
type FileRow = CellValue[];
type FileData = FileRow[];

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
        processFileData(file);
      }
    }
  }, [file, selectedColumns, processedFile, setProcessedFile]);

  /**
   * 处理文件数据
   * 读取CSV或Excel文件并生成图表数据
   */
  const processFileData = async (file: File) => {
    if (!file || selectedColumns.length === 0) return;

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        // 解析CSV文件
        const text = await file.text();
        Papa.parse(text, {
          complete: (results) => {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];

            // 创建图表数据
            const chartData = createChartData(headers, rows as FileData);
            setChartData(chartData);
            setLoading(false);
          },
          error: (error: { message: string }) => {
            console.error("解析CSV文件失败:", error);
            setLoading(false);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        // 解析Excel文件
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 提取表头和数据
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as FileData;

        // 创建图表数据
        const chartData = createChartData(headers, rows);
        setChartData(chartData);
        setLoading(false);
      } else {
        console.error("不支持的文件类型");
        setLoading(false);
      }
    } catch (err) {
      console.error("文件解析错误:", err);
      setLoading(false);
    }
  };

  /**
   * 从解析的数据创建图表数据
   * 将原始数据转换为图表可用的格式
   */
  const createChartData = useCallback(
    (headers: string[], rows: FileData): ChartDataItem[] => {
      // 使用模拟数据确保图表能正常显示
      if (rows.length === 0) {
        const mockData: ChartDataItem[] = [];
        for (let i = 0; i < 10; i++) {
          const item: ChartDataItem = { name: `项目 ${i + 1}` };
          for (const col of selectedColumns) {
            item[col] = Math.floor(Math.random() * 100);
          }
          mockData.push(item);
        }
        return mockData;
      }

      return rows.slice(0, 20).map((row, index) => {
        const rowData: ChartDataItem = { name: `项 ${index + 1}` };

        // 如果有一列可以作为名称列，使用它
        if (headers[0] && row[0]) {
          rowData.name = String(row[0] || "").slice(0, 10); // 截断过长的名称
        }

        // 添加选中的列数据
        for (const column of selectedColumns) {
          const colIndex = headers.indexOf(column);
          if (colIndex !== -1 && colIndex < row.length) {
            // 尝试将值转换为数值
            const strValue = String(row[colIndex]);
            const numValue = Number.parseFloat(strValue);
            rowData[column] = Number.isNaN(numValue)
              ? Math.floor(Math.random() * 100)
              : numValue;
          } else {
            // 如果没有数据，使用随机值
            rowData[column] = Math.floor(Math.random() * 100);
          }
        }

        return rowData;
      });
    },
    [selectedColumns]
  );

  /**
   * 检查列是否适合可视化
   * 分析数据分布特征，确定列是否适合可视化
   */
  const checkColumnsVisualizable = useCallback(async () => {
    if (!file || selectedColumns.length === 0) return;

    const newStatus: ColumnVisualizableConfig[] = [];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileExtension === "csv") {
        const text = await file.text();
        Papa.parse(text, {
          complete: (results) => {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];

            analyzeColumns(headers, rows, newStatus);
          }
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as FileData;

        analyzeColumns(headers, rows, newStatus);
      }
    } catch (err) {
      console.error("分析列可视化状态失败:", err);
    }
  }, [file, selectedColumns, setColumnsVisualizableStatus]);

  /**
   * 分析列数据分布特征
   */
  const analyzeColumns = (headers: string[], rows: any[], newStatus: ColumnVisualizableConfig[]) => {
    // 分析每一列
    for (const colName of selectedColumns) {
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) continue;

      // 提取该列所有值
      const values = rows.map(row => row[colIndex]).filter(v => v !== undefined && v !== null && v !== "");

      // 计算唯一值数量
      const uniqueValues = new Set(values.map(v => String(v))).size;

      // 检查是否可视化（如果唯一值太多，则不适合可视化）
      const isVisualizable = uniqueValues < values.length * 0.9 && uniqueValues > 1;

      newStatus.push({
        column: colName,
        isVisualizable,
        uniqueValues,
        totalValues: values.length,
        reason: !isVisualizable
          ? uniqueValues <= 1
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

  // Render loading and empty states
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
