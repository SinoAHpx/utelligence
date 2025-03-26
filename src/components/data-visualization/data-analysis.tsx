"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataAnalysisProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

// 示例数据
const sampleStats = [
  { name: "平均值", value: 245.76 },
  { name: "中位数", value: 237.5 },
  { name: "标准差", value: 114.28 },
  { name: "最小值", value: 65 },
  { name: "最大值", value: 490 },
  { name: "数据量", value: 50 },
];

const sampleDistribution = [
  { bin: "0-100", count: 5 },
  { bin: "100-200", count: 15 },
  { bin: "200-300", count: 20 },
  { bin: "300-400", count: 8 },
  { bin: "400-500", count: 2 },
];

export default function DataAnalysis({
  file,
  selectedColumns,
  availableColumns,
}: DataAnalysisProps) {
  const [activeTab, setActiveTab] = useState<string>("statistics");
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  const tabs = [
    { id: "statistics", name: "统计描述" },
    { id: "distribution", name: "数据分布" },
    { id: "correlation", name: "相关性分析" },
    { id: "regression", name: "回归分析" },
  ];

  useEffect(() => {
    // 当选定列变化时，默认选择第一列
    if (
      selectedColumns.length > 0 &&
      !selectedColumns.includes(selectedColumn)
    ) {
      setSelectedColumn(selectedColumns[0]);
    }
  }, [selectedColumns, selectedColumn]);

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            数据分析
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            对数据进行统计分析和可视化
          </p>

          <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择分析列：
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedColumns.map((column) => (
                <button
                  key={column}
                  onClick={() => setSelectedColumn(column)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedColumn === column
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {column}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "statistics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                {selectedColumn} - 统计指标
              </h4>
              <div className="overflow-hidden border rounded-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        指标
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        值
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sampleStats.map((stat, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-700"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                {selectedColumn} - 基本统计图
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleStats.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "distribution" && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {selectedColumn} - 数据分布
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "correlation" && selectedColumns.length >= 2 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              相关性分析
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="overflow-hidden border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          变量
                        </th>
                        {selectedColumns.map((col) => (
                          <th
                            key={col}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedColumns.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={
                            rowIndex % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-700"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                            {row}
                          </td>
                          {selectedColumns.map((col, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                            >
                              {rowIndex === colIndex
                                ? "1.0"
                                : (Math.random() * 2 - 1).toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name={selectedColumns[0]}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name={selectedColumns[1]}
                      />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      <Scatter
                        name={`${selectedColumns[0]} vs ${selectedColumns[1]}`}
                        data={Array.from({ length: 20 }, (_, i) => ({
                          x: Math.random() * 100,
                          y: Math.random() * 100,
                        }))}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "regression" && selectedColumns.length >= 2 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              回归分析
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name={selectedColumns[0]}
                        unit=""
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name={selectedColumns[1]}
                        unit=""
                      />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      <Scatter
                        name="数据点"
                        data={Array.from({ length: 20 }, (_, i) => ({
                          x: i * 5,
                          y: 30 + i * 4 + Math.random() * 20 - 10,
                        }))}
                        fill="#8884d8"
                      />
                      <Line
                        name="回归线"
                        data={[
                          { x: 0, y: 30 },
                          { x: 100, y: 230 },
                        ]}
                        type="linear"
                        dataKey="y"
                        stroke="#ff7300"
                        dot={false}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md h-full">
                  <h5 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    回归模型统计
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        R²值:
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        0.923
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        调整后的R²:
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        0.919
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        回归方程:
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        y = 2.0x + 30.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        标准误差:
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        5.87
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        观测值:
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        20
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
