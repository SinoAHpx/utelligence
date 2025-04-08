import React from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartProps } from "@/types/chart-types";

interface RadarChartProps extends ChartProps {
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

export const RadarChartComponent: React.FC<RadarChartProps> = ({
    title,
    chartData,
    xAxisColumn,
    yAxisColumn
}) => {
    // 定义类型帮助处理索引访问
    interface DataItem {
        [key: string]: string | number | null | undefined;
    }

    // 处理雷达图数据
    const radarData = chartData.slice(0, 8).map((item) => {
        const typedItem = item as DataItem;
        const subjectValue = typedItem[xAxisColumn];
        const numericValue = typedItem[yAxisColumn];
        return {
            subject: String(subjectValue || "未知"),
            value: Number(numericValue || 0),
            fullMark: Math.max(...chartData.map((d) => {
                const typedD = d as DataItem;
                return Number(typedD[yAxisColumn] || 0);
            })) * 1.2
        };
    });

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">
                    分类: {xAxisColumn}, 值: {yAxisColumn}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar
                            name={yAxisColumn}
                            dataKey="value"
                            stroke={getChartColor(0)}
                            fill={getChartColor(0)}
                            fillOpacity={0.6}
                        />
                        <Tooltip />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RadarChartComponent; 