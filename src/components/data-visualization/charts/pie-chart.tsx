import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataItem } from "@/types/chart-types";
import { CHART_COLORS, getChartColor } from "@/constants/chart-colors";

interface PieChartProps {
    title: string;
    chartData: ChartDataItem[];
    dataColumn: string;
    duplicateValueHandling?: "merge" | "keep";
}

export const PieChartComponent: React.FC<PieChartProps> = ({
    title,
    chartData,
    dataColumn,
    duplicateValueHandling
}) => {
    // 构建饼图数据：计算每个值的频率
    const pieData = chartData.reduce((acc: { name: string, value: number }[], item) => {
        const value = String(item[dataColumn] || "未知");

        // 根据重复值处理选项处理数据
        if (duplicateValueHandling === "merge") {
            const existingItem = acc.find(a => a.name === value);
            if (existingItem) {
                existingItem.value += 1;
            } else {
                acc.push({ name: value, value: 1 });
            }
        } else {
            // 保留所有值
            acc.push({ name: value, value: 1 });
        }

        return acc;
    }, []);

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
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