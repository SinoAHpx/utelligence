import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartDataItem } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface AreaChartProps {
    title: string;
    chartData: ChartDataItem[];
    xAxisColumn: string;
    yAxisColumn: string;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({
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
};

export default AreaChartComponent; 