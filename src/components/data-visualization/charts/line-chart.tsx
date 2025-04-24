import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { ChartConfig } from "@/types/chart-types";
import { getChartColor } from "@/components/constants/chart-colors";

interface LineChartComponentProps {
    chartConfig: ChartConfig;
}

export const LineChartComponent: React.FC<LineChartComponentProps> = React.memo(({
    chartConfig
}) => {
    const {
        title = "Line Chart",
        processedData = [],
        xAxisColumn,
        yAxisColumn,
        yCategories = []
    } = chartConfig;

    const isMultiLineTrend = yCategories && yCategories.length > 0 && processedData && processedData.length > 0;

    const description = `X: ${xAxisColumn || 'N/A'}${isMultiLineTrend ? `, Y: Count of ${yAxisColumn || 'N/A'} Categories` : yAxisColumn ? `, Y: ${yAxisColumn}` : ''}`;

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
                    <LineChart
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
                        {isMultiLineTrend ? (
                            yCategories.map((category, index) => (
                                <Line
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stroke={getChartColor(index)}
                                    activeDot={{ r: 6 }}
                                    name={String(category)}
                                />
                            ))
                        ) : (
                            <Line
                                type="monotone"
                                dataKey={yAxisColumn}
                                stroke={getChartColor(0)}
                                activeDot={{ r: 8 }}
                                name={yAxisColumn}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

LineChartComponent.displayName = "LineChartComponent";

export default LineChartComponent; 