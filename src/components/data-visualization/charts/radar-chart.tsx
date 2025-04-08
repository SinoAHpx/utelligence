import React from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartDataItem } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface RadarChartProps {
    title: string;
    chartData: ChartDataItem[];
    xAxisColumn: string;
    yAxisColumn: string;
}

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