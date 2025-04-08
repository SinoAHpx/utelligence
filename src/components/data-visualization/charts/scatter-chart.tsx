import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartProps } from "@/types/chart-types";

interface ScatterChartProps extends ChartProps {
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

export const ScatterChartComponent: React.FC<ScatterChartProps> = ({
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
};

export default ScatterChartComponent; 