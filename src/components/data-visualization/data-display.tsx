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
import Charts from "./charts";

// Sample data for charts
const sampleData = [
    { name: "Jan", value: 400, pv: 2400, amt: 2400 },
    { name: "Feb", value: 300, pv: 1398, amt: 2210 },
    { name: "Mar", value: 200, pv: 9800, amt: 2290 },
    { name: "Apr", value: 278, pv: 3908, amt: 2000 },
    { name: "May", value: 189, pv: 4800, amt: 2181 },
    { name: "Jun", value: 239, pv: 3800, amt: 2500 },
    { name: "Jul", value: 349, pv: 4300, amt: 2100 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
];

const radarData = [
    { subject: "Math", A: 120, B: 110, fullMark: 150 },
    { subject: "Chinese", A: 98, B: 130, fullMark: 150 },
    { subject: "English", A: 86, B: 130, fullMark: 150 },
    { subject: "Physics", A: 99, B: 100, fullMark: 150 },
    { subject: "Chemistry", A: 85, B: 90, fullMark: 150 },
    { subject: "Biology", A: 65, B: 85, fullMark: 150 },
];

const pieData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
];

interface DataDisplayProps {
    file: File | null;
}

export default function DataDisplay({ file }: DataDisplayProps) {
    const [activeChartType, setActiveChartType] = useState<string>("all");
    const [useSimpleView, setUseSimpleView] = useState<boolean>(false);

    const chartTypes = [
        { id: "all", name: "所有图表" },
        { id: "bar", name: "柱状图" },
        { id: "line", name: "线形图" },
        { id: "area", name: "面积图" },
        { id: "pie", name: "饼图" },
        { id: "scatter", name: "散点图" },
        { id: "radar", name: "雷达图" },
    ];

    const showChart = (type: string) => {
        return activeChartType === "all" || activeChartType === type;
    };

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
                    <div className="flex flex-wrap gap-2">
                        {chartTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveChartType(type.id)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    activeChartType === type.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={useSimpleView}
                                onChange={() =>
                                    setUseSimpleView(!useSimpleView)
                                }
                            />
                            <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-xs text-gray-600 dark:text-gray-400">
                                简洁视图
                            </span>
                        </label>
                    </div>
                </div>

                {file && (
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <strong>文件名:</strong> {file.name} |{" "}
                        <strong>大小:</strong> {(file.size / 1024).toFixed(2)}{" "}
                        KB
                    </div>
                )}
            </div>

            {useSimpleView ? (
                <Charts isVisible={true} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    {showChart("bar") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                柱状图
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sampleData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="pv" fill="#8884d8" />
                                        <Bar dataKey="amt" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Line Chart */}
                    {showChart("line") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                线形图
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sampleData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="pv"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="amt"
                                            stroke="#82ca9d"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Area Chart */}
                    {showChart("area") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                面积图
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sampleData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="amt"
                                            stackId="1"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pv"
                                            stackId="1"
                                            stroke="#82ca9d"
                                            fill="#82ca9d"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Pie Chart */}
                    {showChart("pie") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                饼图
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Scatter Chart */}
                    {showChart("scatter") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                散点图
                            </h3>
                            <div className="h-64">
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
                                            dataKey="x"
                                            name="stature"
                                            unit="cm"
                                        />
                                        <YAxis
                                            dataKey="y"
                                            name="weight"
                                            unit="kg"
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: "3 3" }}
                                        />
                                        <Legend />
                                        <Scatter
                                            name="数据点"
                                            data={scatterData}
                                            fill="#8884d8"
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Radar Chart */}
                    {showChart("radar") && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                雷达图
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="80%"
                                        data={radarData}
                                    >
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis
                                            angle={30}
                                            domain={[0, 150]}
                                        />
                                        <Radar
                                            name="学生A"
                                            dataKey="A"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                        <Radar
                                            name="学生B"
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
