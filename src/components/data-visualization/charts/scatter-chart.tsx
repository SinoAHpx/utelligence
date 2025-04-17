import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface ScatterChartComponentProps {
    chartConfig: ChartConfig;
}

export const ScatterChartComponent: React.FC<ScatterChartComponentProps> = ({ chartConfig }) => {
    const {
        title = "Scatter Plot",
        processedData = [],
        xAxisColumn,
        yAxisColumn,
        isTruncated = false,
    } = chartConfig;

    const description = `X: ${xAxisColumn || 'N/A'}, Y: ${yAxisColumn || 'N/A'}`;

    if (!xAxisColumn || !yAxisColumn || !processedData || processedData.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">
                        {description} - 正在等待数据或配置...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[340px]">
                    <p className="text-muted-foreground">没有可用于散点图的数据或配置不完整。</p>
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
                    <ScatterChart
                        margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                    >
                        <CartesianGrid />
                        <XAxis
                            type="number"
                            dataKey={xAxisColumn}
                            name={xAxisColumn}
                        />
                        <YAxis
                            type="number"
                            dataKey={yAxisColumn}
                            name={yAxisColumn}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter
                            name={`${xAxisColumn} vs ${yAxisColumn}`}
                            data={processedData}
                            fill={getChartColor(0)}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ScatterChartComponent; 