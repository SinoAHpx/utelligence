"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PlusCircle, AlertCircle, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 类型定义
interface DataDisplayProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
  onColumnSelectionChange?: (columns: string[]) => void;
  chartType?: string;
}

interface ChartData {
  [key: string]: string | number;
}

interface ChartConfig {
  id: string;
  columns: string[];
  chartType: string;
  title: string;
  xAxisColumn?: string;
  yAxisColumn?: string;
}

type CellValue = string | number;
type FileRow = CellValue[];
type FileData = FileRow[];

// 定义图表类型
const chartTypes = [
  { id: "bar", name: "柱状图" },
  { id: "line", name: "线形图" },
  { id: "area", name: "面积图" },
  { id: "pie", name: "饼图" },
  { id: "scatter", name: "散点图" },
  { id: "radar", name: "雷达图" },
];

// 判断某一列是否可视化的配置
interface ColumnVisualizableConfig {
  column: string;
  isVisualizable: boolean;
  uniqueValues: number;
  totalValues: number;
  reason?: string;
}

export default function DataDisplay({
  file,
  selectedColumns,
  availableColumns,
  onColumnSelectionChange,
}: DataDisplayProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [addChartModalOpen, setAddChartModalOpen] = useState<boolean>(false);
  const [selectedColumnsForChart, setSelectedColumnsForChart] = useState<string[]>([]);
  const [selectedChartType, setSelectedChartType] = useState<string>("bar");
  const [userCharts, setUserCharts] = useState<ChartConfig[]>([]);
  const [chartTitle, setChartTitle] = useState<string>("");
  const [xAxisColumn, setXAxisColumn] = useState<string>("");
  const [yAxisColumn, setYAxisColumn] = useState<string>("");
  const [columnsVisualizableStatus, setColumnsVisualizableStatus] = useState<ColumnVisualizableConfig[]>([]);
  const [validationError, setValidationError] = useState<string>("");

  // 当选择的文件改变时处理数据
  useEffect(() => {
    if (file && selectedColumns.length > 0) {
      // 检查文件是否已经处理过
      const fileSignature = `${file.name}-${file.size}`;
      const processedSignature = processedFile
        ? `${processedFile.name}-${processedFile.size}`
        : "";

      if (fileSignature !== processedSignature) {
        setProcessedFile(file);
        setLoading(true);
        processFileData(file);
      }
    }
  }, [file, selectedColumns, processedFile]);

  // 处理文件数据
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

  // 从解析的数据创建图表数据
  const createChartData = React.useCallback(
    (headers: string[], rows: FileData) => {
      // 使用模拟数据确保图表能正常显示
      if (rows.length === 0) {
        const mockData: ChartData[] = [];
        for (let i = 0; i < 10; i++) {
          const item: ChartData = { name: `项目 ${i + 1}` };
          for (const col of selectedColumns) {
            item[col] = Math.floor(Math.random() * 100);
          }
          mockData.push(item);
        }
        return mockData;
      }

      return rows.slice(0, 20).map((row, index) => {
        const rowData: ChartData = { name: `项 ${index + 1}` };

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

  // 随机颜色生成
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  // 检查列是否可视化
  const checkColumnsVisualizable = React.useCallback(async () => {
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

            // 分析每一列
            for (const colName of selectedColumns) {
              const colIndex = headers.indexOf(colName);
              if (colIndex === -1) continue;

              // 提取该列所有值
              const values = rows.map(row => row[colIndex]).filter(v => v !== undefined && v !== null && v !== "");

              // 计算唯一值数量
              const uniqueValues = new Set(values).size;

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
      }
    } catch (err) {
      console.error("分析列可视化状态失败:", err);
    }
  }, [file, selectedColumns]);

  // 打开添加图表对话框
  const openAddChartModal = () => {
    setAddChartModalOpen(true);
    setSelectedColumnsForChart([]);
    setSelectedChartType("bar");
    setChartTitle("");
    setXAxisColumn("");
    setYAxisColumn("");
    setValidationError("");
    // 检查列是否可视化
    checkColumnsVisualizable();
  };

  // 处理列选择
  const handleColumnToggle = (column: string) => {
    if (selectedColumnsForChart.includes(column)) {
      // 移除列
      setSelectedColumnsForChart(
        selectedColumnsForChart.filter(col => col !== column)
      );

      // 如果是X轴或Y轴列，也要清除
      if (xAxisColumn === column) setXAxisColumn("");
      if (yAxisColumn === column) setYAxisColumn("");
    } else {
      // 如果已选择了2列，则不再添加
      if (selectedColumnsForChart.length >= 2) {
        return;
      }

      // 添加列
      setSelectedColumnsForChart([...selectedColumnsForChart, column]);
    }

    // 清除任何验证错误
    setValidationError("");
  };

  // 处理添加图表
  const handleAddChart = () => {
    // 检查是否选择了列
    if (selectedColumnsForChart.length === 0) {
      setValidationError("请至少选择一列数据");
      return;
    }

    // 饼图检查：只能选择一列
    if (selectedChartType === "pie" && selectedColumnsForChart.length !== 1) {
      setValidationError("饼图只能选择一列数据");
      return;
    }

    // 其他图表检查：需要选择两列数据（除非是仅用于展示分布的图表）
    if (selectedChartType !== "pie" && selectedColumnsForChart.length !== 2) {
      setValidationError(`${chartTypes.find(t => t.id === selectedChartType)?.name || "此类型图表"}需要选择两列数据`);
      return;
    }

    // 对于需要X轴和Y轴的图表，检查是否都已选择
    if (["bar", "line", "scatter"].includes(selectedChartType)) {
      if (!xAxisColumn || !yAxisColumn) {
        setValidationError("请选择X轴和Y轴数据列");
        return;
      }
    }

    // 检查选择的列是否可视化
    const nonVisualizableColumns = selectedColumnsForChart.filter(col => {
      const status = columnsVisualizableStatus.find(s => s.column === col);
      return status && !status.isVisualizable;
    });

    if (nonVisualizableColumns.length > 0) {
      const colNames = nonVisualizableColumns.join(", ");
      setValidationError(`选择的数据列 ${colNames} 不适合可视化`);
      return;
    }

    const newChart: ChartConfig = {
      id: Date.now().toString(),
      columns: selectedColumnsForChart,
      chartType: selectedChartType,
      title: chartTitle || `${chartTypes.find(t => t.id === selectedChartType)?.name || ""}图表`,
      xAxisColumn: xAxisColumn || undefined,
      yAxisColumn: yAxisColumn || undefined,
    };

    setUserCharts([...userCharts, newChart]);
    setAddChartModalOpen(false);
    resetChartForm();
  };

  // 重置图表表单
  const resetChartForm = () => {
    setSelectedColumnsForChart([]);
    setSelectedChartType("bar");
    setChartTitle("");
    setXAxisColumn("");
    setYAxisColumn("");
    setValidationError("");
  };

  // 渲染图表
  const renderChart = (config: ChartConfig) => {
    const { chartType, columns, title, xAxisColumn, yAxisColumn } = config;

    // 饼图只需要一列数据
    if (chartType === "pie") {
      const dataColumn = columns[0];

      // 构建饼图数据：计算每个值的频率
      const pieData = chartData.reduce((acc: { name: string, value: number }[], item) => {
        const value = String(item[dataColumn] || "未知");
        const existingItem = acc.find(a => a.name === value);

        if (existingItem) {
          existingItem.value += 1;
        } else {
          acc.push({ name: value, value: 1 });
        }

        return acc;
      }, []);

      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius="70%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`pie-cell-${entry.name}-${index}`}
                      fill={getRandomColor()}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // 对于需要x轴和y轴的图表
    if (chartType === "bar" && xAxisColumn && yAxisColumn) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            X轴: {xAxisColumn}, Y轴: {yAxisColumn}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(0, 20)}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisColumn}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={yAxisColumn}
                  fill={getRandomColor()}
                  name={yAxisColumn}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartType === "line" && xAxisColumn && yAxisColumn) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            X轴: {xAxisColumn}, Y轴: {yAxisColumn}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData.slice(0, 20)}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisColumn}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={yAxisColumn}
                  stroke={getRandomColor()}
                  activeDot={{ r: 8 }}
                  name={yAxisColumn}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartType === "scatter" && xAxisColumn && yAxisColumn) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            X轴: {xAxisColumn}, Y轴: {yAxisColumn}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey={xAxisColumn} name={xAxisColumn} />
                <YAxis type="number" dataKey={yAxisColumn} name={yAxisColumn} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name={`${xAxisColumn} vs ${yAxisColumn}`}
                  data={chartData.slice(0, 50)}
                  fill={getRandomColor()}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // 其他图表类型的实现可以类似添加

    return <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">不支持的图表类型或配置不完整</div>;
  };

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              数据可视化总览
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              已选择 {selectedColumns.length} 列数据:{" "}
              {selectedColumns.join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("visualize"))}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            重新选择列
          </button>
        </div>
      </div>

      {userCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            您尚未创建任何数据可视化图表。<br />
            点击下方按钮，选择需要可视化的列和图表类型。
          </p>
          <Button
            type="button"
            onClick={openAddChartModal}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>添加可视化图表</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              type="button"
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
                {renderChart(chart)}
                <button
                  type="button"
                  onClick={() => {
                    setUserCharts(userCharts.filter(c => c.id !== chart.id));
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  aria-label="删除图表"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 添加图表对话框 */}
      <Dialog open={addChartModalOpen} onOpenChange={setAddChartModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>添加可视化图表</DialogTitle>
            <DialogDescription>
              选择需要可视化的数据列和图表类型（最多选择2列数据）
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">图表标题</Label>
              <input
                id="chart-title"
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="输入图表标题（可选）"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label>选择图表类型</Label>
              <div className="flex flex-wrap gap-2">
                {chartTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedChartType(type.id);
                      // 清除验证错误
                      setValidationError("");
                    }}
                    className={`px-3 py-1 text-xs rounded ${selectedChartType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {selectedChartType === "pie" ? (
                  <p>饼图只需选择一列数据，将展示各个值的占比分布</p>
                ) : (
                  <p>此类型图表需要选择两列数据，分别作为X轴和Y轴</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>选择数据列 {selectedColumnsForChart.length > 0 && `(已选择 ${selectedColumnsForChart.length}/2)`}</Label>
                {columnsVisualizableStatus.some(col => !col.isVisualizable) && (
                  <div className="flex items-center text-amber-500 text-xs">
                    <AlertCircle size={14} className="mr-1" />
                    部分列不适合可视化
                  </div>
                )}
              </div>

              <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-2">
                {selectedColumns.map((column) => {
                  const colStatus = columnsVisualizableStatus.find(s => s.column === column);
                  const isVisualizable = colStatus ? colStatus.isVisualizable : true;

                  return (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={`column-${column}`}
                        checked={selectedColumnsForChart.includes(column)}
                        onCheckedChange={() => handleColumnToggle(column)}
                        disabled={!isVisualizable || (selectedColumnsForChart.length >= 2 && !selectedColumnsForChart.includes(column))}
                      />
                      <Label
                        htmlFor={`column-${column}`}
                        className={`cursor-pointer flex items-center ${!isVisualizable ? 'text-gray-400' : ''}`}
                      >
                        {column}
                        {!isVisualizable && colStatus?.reason && (
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle size={14} className="ml-1 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{colStatus.reason}</p>
                                <p className="text-xs mt-1">唯一值: {colStatus.uniqueValues}/{colStatus.totalValues}</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>

              {validationError && (
                <p className="text-red-500 text-xs flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationError}
                </p>
              )}
            </div>

            {/* X轴和Y轴选择器（仅在选择了两列且不是饼图时显示） */}
            {selectedColumnsForChart.length === 2 && selectedChartType !== "pie" && (
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <h4 className="text-sm font-medium">设置坐标轴</h4>

                <div className="space-y-2">
                  <Label>X轴（水平轴）</Label>
                  <RadioGroup
                    value={xAxisColumn}
                    onValueChange={setXAxisColumn}
                    className="flex flex-col space-y-1"
                  >
                    {selectedColumnsForChart.map(column => (
                      <div key={`x-${column}`} className="flex items-center space-x-2">
                        <RadioGroupItem value={column} id={`x-${column}`} />
                        <Label htmlFor={`x-${column}`}>{column}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Y轴（垂直轴）</Label>
                  <RadioGroup
                    value={yAxisColumn}
                    onValueChange={setYAxisColumn}
                    className="flex flex-col space-y-1"
                  >
                    {selectedColumnsForChart.map(column => (
                      <div key={`y-${column}`} className="flex items-center space-x-2">
                        <RadioGroupItem value={column} id={`y-${column}`} />
                        <Label htmlFor={`y-${column}`}>{column}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddChartModalOpen(false);
                resetChartForm();
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleAddChart}
              disabled={selectedColumnsForChart.length === 0}
            >
              添加图表
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
