import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartProps } from "@/types/chart-types";

interface LineChartProps extends ChartProps {
    xAxisColumn: string;
    yAxisColumn: string;
}

// 美观的配色方案
const CHART_COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F",
    "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57", "#83a6ed", "#8dd1e1",
    "#a4add3", "#d85896", "#ffc0cb", "#e8c3b9",
];

// 获取颜色的辅助函数
const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

export const LineChartComponent: React.FC<LineChartProps> = ({
    title,
    chartData,
    xAxisColumn,
    yAxisColumn
}) => {
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
};

export default LineChartComponent; 