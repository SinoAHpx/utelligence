import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartDataItem } from "@/types/chart-types";
import { getChartColor } from "@/constants/chart-colors";

interface BarChartComponentProps {
    chartConfig: ChartConfig;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
    chartConfig,
}) => {
    const {
        title,
        processedData,
        layout,
        yCategories,
        yKey,
        xAxisColumn,
        yAxisColumn,
    } = chartConfig;

    const displayTitle = title || "Bar Chart";

    const dataToRender = processedData?.slice(0, 50) ?? [];

    if (!processedData || dataToRender.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{displayTitle}</CardTitle>
                    <CardDescription className="text-xs">No data available for this configuration.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[340px]">
                    No Data
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{displayTitle}</CardTitle>
                <CardDescription className="text-xs">
                    X: {xAxisColumn} | Y: {yAxisColumn} {layout === "stacked" ? "(Stacked)" : "(Count)"}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataToRender}
                        margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={60}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        {layout === "stacked" && yCategories && yCategories.length > 0 ? (
                            yCategories.map((category, index) => (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    stackId="a"
                                    fill={getChartColor(index)}
                                    name={category}
                                />
                            ))
                        ) : layout === "simple" && yKey ? (
                            <Bar
                                dataKey={yKey}
                                fill={getChartColor(0)}
                                name={yAxisColumn || yKey}
                            />
                        ) : null}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default BarChartComponent; 