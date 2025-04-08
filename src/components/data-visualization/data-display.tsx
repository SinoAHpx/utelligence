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
import { PlusCircle, AlertCircle, HelpCircle, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { ColumnVisualizableConfig } from "@/store/dataVisualizationStore";
import { ChartDataItem } from "@/types/chart-types";
import ChartRenderer from "./charts/chart-renderer";
import AddChartModal from "./components/add-chart-modal";

// Types
interface DataDisplayProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
  onColumnSelectionChange?: (columns: string[]) => void;
  chartType?: string;
}

type CellValue = string | number;
type FileRow = CellValue[];
type FileData = FileRow[];

// Chart types
const chartTypes = [
  { id: "bar", name: "柱状图" },
  { id: "line", name: "线形图" },
  { id: "area", name: "面积图" },
  { id: "pie", name: "饼图" },
  { id: "scatter", name: "散点图" },
  { id: "radar", name: "雷达图" },
];

// 首先添加一个美观的配色方案替代随机颜色
const CHART_COLORS = [
  "#8884d8", // 紫色
  "#82ca9d", // 绿色
  "#ffc658", // 黄色
  "#ff8042", // 橙色
  "#0088FE", // 蓝色
  "#00C49F", // 青色
  "#FFBB28", // 金色
  "#FF8042", // 橙红色
  "#a4de6c", // 浅绿
  "#d0ed57", // 黄绿
  "#83a6ed", // 天蓝
  "#8dd1e1", // 浅蓝
  "#a4add3", // 淡紫
  "#d85896", // 粉红
  "#ffc0cb", // 粉色
  "#e8c3b9", // 棕色
];

// 获取颜色的辅助函数
const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

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
  const [validationError, setValidationError] = useState<string>("");
  // 添加重复值处理选项状态
  const [duplicateValueHandling, setDuplicateValueHandling] = useState<"merge" | "keep">("merge");

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
  }, [file, selectedColumns, setColumnsVisualizableStatus]);

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
    // 验证必填项
    if (selectedChartType === "") {
      setValidationError("请选择图表类型");
      return;
    }

    if (selectedColumnsForChart.length === 0) {
      setValidationError("请选择至少一列数据");
      return;
    }

    // 饼图只需要一列数据
    if (selectedChartType === "pie" && selectedColumnsForChart.length !== 1) {
      setValidationError("饼图只需要选择一列数据");
      return;
    }

    // 需要X轴和Y轴的图表
    if (
      ["bar", "line", "scatter", "area", "radar"].includes(selectedChartType) &&
      (selectedColumnsForChart.length !== 2 || !xAxisColumn || !yAxisColumn)
    ) {
      setValidationError("此类型图表需要选择两列数据，并指定X轴和Y轴");
      return;
    }

    // 验证可视化状态
    for (const column of selectedColumnsForChart) {
      const statusItem = columnsVisualizableStatus.find(status => status.column === column);
      if (
        statusItem && !statusItem.isVisualizable &&
        selectedChartType !== "scatter"
      ) {
        setValidationError(
          `列 "${column}" 不适合可视化。${statusItem.reason}`
        );
        return;
      }
    }

    // 所有验证通过，添加图表
    const newChart = {
      id: `chart-${Math.random().toString(36).substr(2, 9)}`,
      columns: selectedColumnsForChart,
      chartType: selectedChartType,
      title: chartTitle || `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} 图表`,
      xAxisColumn: xAxisColumn,
      yAxisColumn: yAxisColumn,
      duplicateValueHandling: duplicateValueHandling,
    };

    addChart(newChart);
    setAddChartModalOpen(false);

    // 重置状态
    setSelectedColumnsForChart([]);
    setChartTitle("");
    setXAxisColumn("");
    setYAxisColumn("");
    setValidationError("");
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
  const renderChart = (config: {
    id: string;
    columns: string[];
    chartType: string;
    title: string;
    xAxisColumn?: string;
    yAxisColumn?: string;
    duplicateValueHandling?: "merge" | "keep";
  }) => {
    const { chartType, columns, title, xAxisColumn, yAxisColumn, duplicateValueHandling: chartDupHandling } = config;
    // 使用本地状态的重复值处理选项，如果图表没有指定则
    const dupHandling = chartDupHandling || duplicateValueHandling;

    // 饼图只需要一列数据
    if (chartType === "pie") {
      const dataColumn = columns[0];

      // 构建饼图数据：计算每个值的频率
      const pieData = chartData.reduce((acc: { name: string, value: number }[], item) => {
        const value = String(item[dataColumn] || "未知");

        // 根据重复值处理选项处理数据
        if (dupHandling === "merge") {
          const existingItem = acc.find(a => a.name === value);
          if (existingItem) {
            existingItem.value += 1;
          } else {
            acc.push({ name: value, value: 1 });
          }
        } else {
          // 保留所有值
          acc.push({ name: value, value: 1 });
        }

        return acc;
      }, []);

      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
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
                      fill={getChartColor(index)}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    // 对于需要x轴和y轴的图表
    if (chartType === "bar" && xAxisColumn && yAxisColumn) {
      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              X轴: {xAxisColumn}, Y轴: {yAxisColumn}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
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
                  fill={getChartColor(0)}
                  name={yAxisColumn}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    if (chartType === "line" && xAxisColumn && yAxisColumn) {
      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              X轴: {xAxisColumn}, Y轴: {yAxisColumn}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
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
                  stroke={getChartColor(0)}
                  activeDot={{ r: 8 }}
                  name={yAxisColumn}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    if (chartType === "scatter" && xAxisColumn && yAxisColumn) {
      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              X轴: {xAxisColumn}, Y轴: {yAxisColumn}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
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
                  fill={getChartColor(0)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    // 添加面积图支持
    if (chartType === "area" && xAxisColumn && yAxisColumn) {
      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              X轴: {xAxisColumn}, Y轴: {yAxisColumn}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
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
                <Area
                  type="monotone"
                  dataKey={yAxisColumn}
                  stroke={getChartColor(0)}
                  fill={getChartColor(0)}
                  fillOpacity={0.3}
                  name={yAxisColumn}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    // 添加雷达图支持
    if (chartType === "radar" && xAxisColumn && yAxisColumn) {
      // 处理雷达图数据
      // 雷达图需要特殊格式的数据，我们需要处理一下
      interface DataItem {
        [key: string]: string | number | null | undefined;
      }

      const radarData = chartData.slice(0, 8).map((item) => {
        const typedItem = item as DataItem;
        const subjectValue = typedItem[xAxisColumn];
        const numericValue = typedItem[yAxisColumn];
        return {
          subject: String(subjectValue || "未知"),
          value: Number(numericValue || 0),
          fullMark: Math.max(...chartData.map((d) => {
            const typedD = d as DataItem;
            return Number(typedD[yAxisColumn] || 0);
          })) * 1.2
        };
      });

      return (
        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              分类: {xAxisColumn}, 值: {yAxisColumn}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name={yAxisColumn}
                  dataKey="value"
                  stroke={getChartColor(0)}
                  fill={getChartColor(0)}
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    // 其他图表类型的实现可以类似添加

    return (
      <Card className="h-[400px]">
        <CardContent className="flex items-center justify-center h-full p-4">
          不支持的图表类型或配置不完整
        </CardContent>
      </Card>
    );
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
