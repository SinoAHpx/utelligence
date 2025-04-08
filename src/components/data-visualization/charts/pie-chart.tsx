import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartProps } from "@/types/chart-types";

interface PieChartProps extends ChartProps {
    dataColumn: string;
    duplicateValueHandling: "merge" | "keep";
}

// 美观的配色方案
const CHART_COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F",
    "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57", "#83a6ed", "#8dd1e1",
    "#a4add3", "#d85896", "#ffc0cb", "#e8c3b9",
];

// 获取颜色的辅助函数
const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

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