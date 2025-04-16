import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface PieChartComponentProps {
    chartConfig: ChartConfig;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ chartConfig }) => {
    const {
        title = "Pie Chart",
        processedData = [],
        yAxisColumns = [],
    } = chartConfig;

    const dataColumn = yAxisColumns.length > 0 ? yAxisColumns[0] : "(未指定列)";

    const pieData = processedData;

    if (!pieData || pieData.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">正在等待数据...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[340px]">
                    <p className="text-muted-foreground">没有可用于饼图的数据。</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">
                    显示列: {dataColumn}
                </CardDescription>
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
};

export default PieChartComponent; 