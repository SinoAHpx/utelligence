import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartDataItem } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface ScatterChartProps {
    title: string;
    chartData: ChartDataItem[];
    xAxisColumn: string;
    yAxisColumn: string;
}

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