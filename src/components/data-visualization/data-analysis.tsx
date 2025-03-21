"use client";

import React, { useState } from "react";
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
}

// Sample correlation data
const correlationData = [
    { id: "col1", col1: 1, col2: 0.82, col3: -0.12, col4: 0.45 },
    { id: "col2", col1: 0.82, col2: 1, col3: -0.05, col4: 0.67 },
    { id: "col3", col1: -0.12, col2: -0.05, col3: 1, col4: -0.22 },
    { id: "col4", col1: 0.45, col2: 0.67, col3: -0.22, col4: 1 },
];

// Sample statistics data
const statsData = {
    col1: {
        mean: 45.23,
        median: 42.5,
        std: 15.67,
        min: 12.3,
        max: 89.7,
        skew: 0.45,
    },
    col2: {
        mean: 126.78,
        median: 125.0,
        std: 42.31,
        min: 45.2,
        max: 210.3,
        skew: 0.12,
    },
    col3: {
        mean: 0.56,
        median: 0.5,
        std: 0.25,
        min: 0.0,
        max: 1.0,
        skew: 0.05,
    },
    col4: {
        mean: 32.45,
        median: 30.0,
        std: 12.78,
        min: 10.5,
        max: 65.2,
        skew: 0.78,
    },
};

// Sample distribution data
const distributionData = [
    { bin: "0-10", count: 5 },
    { bin: "10-20", count: 12 },
    { bin: "20-30", count: 25 },
    { bin: "30-40", count: 30 },
    { bin: "40-50", count: 22 },
    { bin: "50-60", count: 15 },
    { bin: "60-70", count: 8 },
    { bin: "70-80", count: 3 },
    { bin: "80-90", count: 1 },
];

// Sample regression data
const regressionData = [
    { x: 10, y: 12, prediction: 11.5 },
    { x: 15, y: 16, prediction: 17.2 },
    { x: 20, y: 22, prediction: 22.9 },
    { x: 25, y: 24, prediction: 28.6 },
    { x: 30, y: 30, prediction: 34.3 },
    { x: 35, y: 37, prediction: 40.0 },
    { x: 40, y: 45, prediction: 45.7 },
    { x: 45, y: 50, prediction: 51.4 },
    { x: 50, y: 55, prediction: 57.1 },
    { x: 55, y: 58, prediction: 62.8 },
];

export default function DataAnalysis({ file }: DataAnalysisProps) {
    const [activeTab, setActiveTab] = useState<string>("statistics");
    const [selectedColumn, setSelectedColumn] = useState<string>("col1");

    const tabs = [
        { id: "statistics", name: "统计描述" },
        { id: "distribution", name: "数据分布" },
        { id: "correlation", name: "相关性分析" },
        { id: "regression", name: "回归分析" },
    ];

    const columns = [
        { id: "col1", name: "特征 1" },
        { id: "col2", name: "特征 2" },
        { id: "col3", name: "特征 3" },
        { id: "col4", name: "特征 4" },
    ];

    if (!file) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        文件分析: <span className="font-bold">{file.name}</span>
                    </h3>

                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                            选择列:
                        </span>
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        >
                            {columns.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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

                <div className="mt-4">
                    {activeTab === "statistics" && (
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                                统计描述 -{" "}
                                {
                                    columns.find(
                                        (col) => col.id === selectedColumn
                                    )?.name
                                }
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(
                                    statsData[
                                        selectedColumn as keyof typeof statsData
                                    ]
                                ).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                                    >
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {key === "mean"
                                                ? "均值"
                                                : key === "median"
                                                ? "中位数"
                                                : key === "std"
                                                ? "标准差"
                                                : key === "min"
                                                ? "最小值"
                                                : key === "max"
                                                ? "最大值"
                                                : key === "skew"
                                                ? "偏度"
                                                : key}
                                        </div>
                                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            {typeof value === "number"
                                                ? value.toFixed(2)
                                                : value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    数据质量
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            总行数
                                        </div>
                                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            1,245
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            缺失值
                                        </div>
                                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            12 (0.96%)
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            异常值
                                        </div>
                                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            5 (0.40%)
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            重复值
                                        </div>
                                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            0 (0.00%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "distribution" && (
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                                数据分布 -{" "}
                                {
                                    columns.find(
                                        (col) => col.id === selectedColumn
                                    )?.name
                                }
                            </h4>

                            <div className="h-64 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={distributionData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="bin" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [
                                                `${value} 个数据点`,
                                                "频数",
                                            ]}
                                            labelFormatter={(label) =>
                                                `区间: ${label}`
                                            }
                                        />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">分布分析:</p>
                                <p>
                                    数据呈现近似正态分布，集中在30-40区间，偏度为0.45，表明数据略微右偏。没有明显的极端异常值。
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "correlation" && (
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                                相关性分析
                            </h4>

                            <div className="overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                特征
                                            </th>
                                            {columns.map((col) => (
                                                <th
                                                    key={col.id}
                                                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                >
                                                    {col.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {correlationData.map(
                                            (row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className={
                                                        rowIndex % 2 === 0
                                                            ? "bg-white dark:bg-gray-800"
                                                            : "bg-gray-50 dark:bg-gray-700"
                                                    }
                                                >
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {
                                                            columns.find(
                                                                (col) =>
                                                                    col.id ===
                                                                    row.id
                                                            )?.name
                                                        }
                                                    </td>
                                                    {columns.map((col) => {
                                                        const value = row[
                                                            col.id as keyof typeof row
                                                        ] as number;
                                                        let cellClass =
                                                            "px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";

                                                        // Color based on correlation strength
                                                        if (row.id !== col.id) {
                                                            if (
                                                                value > 0.7 ||
                                                                value < -0.7
                                                            ) {
                                                                cellClass +=
                                                                    " bg-red-100 dark:bg-red-900/20";
                                                            } else if (
                                                                value > 0.5 ||
                                                                value < -0.5
                                                            ) {
                                                                cellClass +=
                                                                    " bg-yellow-100 dark:bg-yellow-900/20";
                                                            }
                                                        } else {
                                                            cellClass +=
                                                                " bg-blue-100 dark:bg-blue-900/20";
                                                        }

                                                        return (
                                                            <td
                                                                key={col.id}
                                                                className={
                                                                    cellClass
                                                                }
                                                            >
                                                                {value.toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">
                                    相关性分析结果:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        特征1与特征2高度相关
                                        (0.82)，可能存在共线性问题
                                    </li>
                                    <li>特征2与特征4中度相关 (0.67)</li>
                                    <li>
                                        特征3与其他特征相关性较弱，可能包含独立信息
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === "regression" && (
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                                回归分析 (特征1 vs 特征2)
                            </h4>

                            <div className="h-72 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            bottom: 10,
                                            left: 10,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="特征1"
                                            unit=""
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="特征2"
                                            unit=""
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: "3 3" }}
                                        />
                                        <Legend />
                                        <Scatter
                                            name="数据点"
                                            data={regressionData}
                                            fill="#8884d8"
                                        />
                                        <Line
                                            name="回归线"
                                            type="monotone"
                                            dataKey="prediction"
                                            data={regressionData}
                                            stroke="#ff7300"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        回归方程
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        y = 0.115x + 1.35
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        决定系数 (R²)
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        0.945
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        均方根误差 (RMSE)
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        1.23
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        p值
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        &lt; 0.001
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">
                                    回归分析结果:
                                </p>
                                <p>
                                    这两个特征之间存在非常强的线性关系 (R² =
                                    0.945)，回归模型具有很高的解释力和预测能力。
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
