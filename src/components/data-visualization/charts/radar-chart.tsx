import React from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/components/constants/chart-colors";

interface RadarChartComponentProps {
    chartConfig: ChartConfig;
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ chartConfig }) => {
    const {
        title = "雷达图",
        processedData = [],
        xAxisColumn,
        isTruncated = false,
    } = chartConfig;

    const description = `分类列: ${xAxisColumn || 'N/A'} (计数统计)`;

    // If data is completely empty or undefined
    if (!processedData) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">
                        {description} - 正在加载数据...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[340px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">正在处理图表数据</p>
                </CardContent>
            </Card>
        );
    }

    // If data is empty array (no valid data found)
    if (processedData.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[340px]">
                    <Ban className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">此分类列没有可用于雷达图的有效数据</p>
                    <p className="text-xs text-muted-foreground mt-2">所有值为空或N/A，请选择其他列</p>
                </CardContent>
            </Card>
        );
    }

    // If there are too few data points (fewer than 3) 
    if (processedData.length < 3) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs flex items-center">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[340px]">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                    <p className="text-muted-foreground">雷达图需要至少 3 个不同的分类值</p>
                    <p className="text-xs text-muted-foreground mt-2">当前只有 {processedData.length} 个不同的值</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs flex items-center">
                    {description}
                    {isTruncated && (
                        <span className="ml-2 flex items-center text-amber-600 dark:text-amber-400" title="数据点过多，已截断显示">
                            <AlertTriangle size={12} className="mr-1" />
                            (已截断)
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="70%" data={processedData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar
                            name="计数"
                            dataKey="value"
                            stroke={getChartColor(0)}
                            fill={getChartColor(0)}
                            fillOpacity={0.6}
                        />
                        <Tooltip formatter={(value: number) => [`${value} 项`, '计数']} />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

RadarChartComponent.displayName = "RadarChartComponent";

export default React.memo(RadarChartComponent); 