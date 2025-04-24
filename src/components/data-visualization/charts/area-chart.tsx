import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { AlertTriangle } from "lucide-react";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/components/constants/chart-colors";

interface AreaChartComponentProps {
    chartConfig: ChartConfig;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = React.memo(({
    chartConfig
}) => {
    const {
        title = "Area Chart",
        processedData = [],
        xAxisColumn,
        yAxisColumn,
        yCategories = [],
        isTruncated = false,
    } = chartConfig;

    const isStackedArea = yCategories && yCategories.length > 0;
    const isSingleNumericArea = !isStackedArea && yAxisColumn;
    const primaryYAxisColumn = yAxisColumn || "value";

    const description = `X: ${xAxisColumn || 'N/A'}${isStackedArea ? `, Y: Stacked count of ${primaryYAxisColumn} Categories` : `, Y: Sum of ${primaryYAxisColumn}`}`;

    if (!xAxisColumn || !yAxisColumn || !processedData || processedData.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">
                        {description} - 正在等待数据...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[340px]">
                    <p className="text-muted-foreground">没有可用于面积图的数据或配置不完整。</p>
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
                    <AreaChart
                        data={processedData}
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
                        {isStackedArea ? (
                            yCategories.map((category: string, index: number) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1"
                                    stroke={getChartColor(index)}
                                    fill={getChartColor(index)}
                                    fillOpacity={0.6}
                                    name={String(category)}
                                    connectNulls
                                />
                            ))
                        ) : isSingleNumericArea ? (
                            <Area
                                type="monotone"
                                dataKey={yAxisColumn}
                                stroke={getChartColor(0)}
                                fill={getChartColor(0)}
                                fillOpacity={0.3}
                                name={yAxisColumn}
                                connectNulls
                            />
                        ) : null}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

AreaChartComponent.displayName = "AreaChartComponent";

export default AreaChartComponent; 