import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { AlertTriangle } from "lucide-react";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/components/constants/chart-colors";

interface PieChartComponentProps {
    chartConfig: ChartConfig;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = React.memo(({
    chartConfig
}) => {
    const {
        title = "Pie Chart",
        processedData = [],
        yAxisColumn,
        isTruncated = false,
    } = chartConfig;

    const dataColumn = yAxisColumn || "(未指定列)";
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
                <CardDescription className="text-xs flex items-center">
                    显示列: {dataColumn}
                    {isTruncated && (
                        <span className="ml-2 flex items-center text-amber-600 dark:text-amber-400" title="类别过多，已将最小的组合为 'Other'">
                            <AlertTriangle size={12} className="mr-1" />
                            (已分组)
                        </span>
                    )}
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
});
PieChartComponent.displayName = "PieChartComponent";

export default PieChartComponent; 