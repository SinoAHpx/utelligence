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
    columns?: string[]; // 添加 columns 属性以支持多列数据
}

export const RadarChartComponent: React.FC<RadarChartProps> = ({
    title,
    chartData,
    xAxisColumn,
    yAxisColumn,
    columns = []
}) => {
    // 定义类型帮助处理索引访问
    interface DataItem {
        [key: string]: string | number | null | undefined;
    }

    // 确定要使用的列
    // 如果提供了columns且长度>=3，则使用columns；否则使用xAxisColumn和yAxisColumn
    const useMultipleColumns = columns.length >= 3;
    const categoryColumn = useMultipleColumns ? columns[0] : xAxisColumn;
    const dataColumns = useMultipleColumns
        ? columns.slice(1)
        : [yAxisColumn];

    // 提取雷达图的唯一类别
    const categories = [...new Set(
        chartData.slice(0, 10).map(item => String((item as DataItem)[categoryColumn] || "未知"))
    )];

    // 处理雷达图数据 - 每个类别作为一个数据点
    const radarData = categories.map(category => {
        // 创建基本对象，带有类别名
        const dataPoint: Record<string, string | number> = {
            subject: category
        };

        // 对于每个数据列，计算该类别的平均值
        dataColumns.forEach(colName => {
            // 找到所有匹配该类别的行
            const matchingRows = chartData.filter(
                item => String((item as DataItem)[categoryColumn]) === category
            );

            // 计算该列在这个类别下的平均值
            if (matchingRows.length > 0) {
                const sum = matchingRows.reduce(
                    (acc, row) => acc + Number((row as DataItem)[colName] || 0),
                    0
                );
                dataPoint[colName] = sum / matchingRows.length;
            } else {
                dataPoint[colName] = 0;
            }
        });

        return dataPoint;
    });

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">
                    {useMultipleColumns
                        ? `分类: ${categoryColumn}, 维度: ${dataColumns.join(', ')}`
                        : `分类: ${xAxisColumn}, 值: ${yAxisColumn}`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />

                        {dataColumns.map((column, index) => (
                            <Radar
                                key={column}
                                name={column}
                                dataKey={column}
                                stroke={getChartColor(index)}
                                fill={getChartColor(index)}
                                fillOpacity={0.6}
                            />
                        ))}

                        <Tooltip />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RadarChartComponent; 