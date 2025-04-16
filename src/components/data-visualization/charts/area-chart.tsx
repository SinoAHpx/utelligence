import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface AreaChartComponentProps {
    chartConfig: ChartConfig;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ chartConfig }) => {
    const {
        title = "Area Chart",
        processedData = [],
        xAxisColumn,
        yAxisColumns = [],
        categories = [],
        numericYKey,
    } = chartConfig;

    const primaryYAxisColumn = yAxisColumns.length > 0 ? yAxisColumns[0] : "value";

    const isStackedArea = categories && categories.length > 0 && processedData && processedData.length > 0;
    const isSingleNumericArea = !isStackedArea && numericYKey && processedData && processedData.length > 0;

    const description = `X: ${xAxisColumn || 'N/A'}${isStackedArea ? `, Y: Stacked count of ${primaryYAxisColumn} Categories` : isSingleNumericArea ? `, Y: ${numericYKey}` : yAxisColumns.length > 0 ? `, Y: ${yAxisColumns.join(', ')}` : ''}`;

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">
                    {description}
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
                            categories.map((category, index) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1"
                                    stroke={getChartColor(index)}
                                    fill={getChartColor(index)}
                                    fillOpacity={0.6}
                                    name={String(category)}
                                />
                            ))
                        ) : isSingleNumericArea ? (
                            <Area
                                type="monotone"
                                dataKey={numericYKey}
                                stroke={getChartColor(0)}
                                fill={getChartColor(0)}
                                fillOpacity={0.3}
                                name={numericYKey}
                            />
                        ) : null}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default AreaChartComponent; 