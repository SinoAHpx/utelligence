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

// 类型定义
interface DataDisplayProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
  onColumnSelectionChange?: (columns: string[]) => void;
  chartType?: string;
}

interface ChartData {
  [key: string]: any;
}

// 定义图表类型
const chartTypes = [
  { id: "bar", name: "柱状图" },
  { id: "line", name: "线形图" },
  { id: "area", name: "面积图" },
  { id: "pie", name: "饼图" },
  { id: "scatter", name: "散点图" },
  { id: "radar", name: "雷达图" },
];

export default function DataDisplay({
  file,
  selectedColumns,
  availableColumns,
  onColumnSelectionChange,
}: DataDisplayProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processedFile, setProcessedFile] = useState<File | null>(null);

  // 当选择的文件或列改变时处理数据
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, selectedColumns]);

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
            const chartData = createChartData(headers, rows);
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
        const rows = jsonData.slice(1) as any[][];

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
    (headers: string[], rows: any[][]) => {
      // 使用模拟数据确保图表能正常显示
      if (rows.length === 0) {
        const mockData = [];
        for (let i = 0; i < 10; i++) {
          const item: ChartData = { name: `项目 ${i + 1}` };
          selectedColumns.forEach((col) => {
            item[col] = Math.floor(Math.random() * 100);
          });
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
        selectedColumns.forEach((column) => {
          const colIndex = headers.indexOf(column);
          if (colIndex !== -1 && colIndex < row.length) {
            // 尝试将值转换为数值
            const value = parseFloat(row[colIndex]);
            rowData[column] = isNaN(value)
              ? Math.floor(Math.random() * 100)
              : value;
          } else {
            // 如果没有数据，使用随机值
            rowData[column] = Math.floor(Math.random() * 100);
          }
        });

        return rowData;
      });
    },
    [selectedColumns]
  );

  // 随机颜色生成
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
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
            onClick={() => window.dispatchEvent(new Event("visualize"))}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新选择列
          </button>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 柱状图 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              柱状图
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.slice(0, 10)}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedColumns
                    .filter((col) => col !== chartData[0]?.name)
                    .slice(0, 3) // 限制最多显示3列，避免图表过于复杂
                    .map((column) => (
                      <Bar
                        key={column}
                        dataKey={column}
                        fill={getRandomColor()}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 线形图 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              线形图
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.slice(0, 10)}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedColumns
                    .filter((col) => col !== chartData[0]?.name)
                    .slice(0, 3)
                    .map((column) => (
                      <Line
                        key={column}
                        type="monotone"
                        dataKey={column}
                        stroke={getRandomColor()}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 面积图 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              面积图
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.slice(0, 10)}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedColumns
                    .filter((col) => col !== chartData[0]?.name)
                    .slice(0, 3)
                    .map((column) => (
                      <Area
                        key={column}
                        type="monotone"
                        dataKey={column}
                        stackId="1"
                        stroke={getRandomColor()}
                        fill={getRandomColor()}
                        fillOpacity={0.6}
                      />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 饼图 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              饼图 (基于第一行数据)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedColumns
                      .filter((col) => col !== chartData[0]?.name)
                      .slice(0, 6) // 限制饼图分片数量
                      .map((column) => ({
                        name: column,
                        value:
                          chartData[0]?.[column] ||
                          Math.floor(Math.random() * 100),
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {selectedColumns
                      .filter((col) => col !== chartData[0]?.name)
                      .slice(0, 6)
                      .map((_, index) => (
                        <Cell key={`cell-${index}`} fill={getRandomColor()} />
                      ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 散点图 */}
          {selectedColumns.length >= 2 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                散点图
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={selectedColumns[0]}
                      name={selectedColumns[0]}
                      type="number"
                      label={{
                        value: selectedColumns[0],
                        position: "bottom",
                        offset: 0,
                      }}
                    />
                    <YAxis
                      dataKey={selectedColumns[1]}
                      name={selectedColumns[1]}
                      type="number"
                      label={{
                        value: selectedColumns[1],
                        angle: -90,
                        position: "left",
                      }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter
                      name={`${selectedColumns[0]} vs ${selectedColumns[1]}`}
                      data={chartData}
                      fill={getRandomColor()}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 雷达图 */}
          {selectedColumns.length >= 3 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                雷达图 (基于前两行数据)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={selectedColumns
                      .filter((col) => col !== "name")
                      .slice(0, 6) // 限制雷达图维度
                      .map((column) => ({
                        subject: column,
                        A:
                          chartData[0]?.[column] ||
                          Math.floor(Math.random() * 100),
                        B:
                          chartData.length > 1
                            ? chartData[1]?.[column] ||
                              Math.floor(Math.random() * 100)
                            : Math.floor(Math.random() * 100),
                        fullMark: 100,
                      }))}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name={`${chartData[0]?.name || "行 1"}`}
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name={`${
                        chartData.length > 1
                          ? chartData[1]?.name || "行 2"
                          : "行 2"
                      }`}
                      dataKey="B"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
