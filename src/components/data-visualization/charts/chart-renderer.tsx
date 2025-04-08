import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ChartConfig, ChartDataItem } from "@/types/chart-types";
import PieChartComponent from "./pie-chart";
import BarChartComponent from "./bar-chart";
import LineChartComponent from "./line-chart";
import ScatterChartComponent from "./scatter-chart";
import AreaChartComponent from "./area-chart";
import RadarChartComponent from "./radar-chart";

interface ChartRendererProps {
    chartConfig: ChartConfig;
    chartData: ChartDataItem[];
    onRemoveChart?: (chartId: string) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
    chartConfig,
    chartData,
    onRemoveChart,
}) => {
    const { chartType, columns, title, xAxisColumn, yAxisColumn, duplicateValueHandling = "merge" } = chartConfig;

    // 饼图只需要一列数据
    if (chartType === "pie" && columns.length > 0) {
        const dataColumn = columns[0];
        return (
            <PieChartComponent
                title={title}
                chartData={chartData}
                dataColumn={dataColumn}
                duplicateValueHandling={duplicateValueHandling}
            />
        );
    }

    // 对于需要x轴和y轴的图表
    if (chartType === "bar" && xAxisColumn && yAxisColumn) {
        return (
            <BarChartComponent
                title={title}
                chartData={chartData}
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    if (chartType === "line" && xAxisColumn && yAxisColumn) {
        return (
            <LineChartComponent
                title={title}
                chartData={chartData}
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    if (chartType === "scatter" && xAxisColumn && yAxisColumn) {
        return (
            <ScatterChartComponent
                title={title}
                chartData={chartData}
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    if (chartType === "area" && xAxisColumn && yAxisColumn) {
        return (
            <AreaChartComponent
                title={title}
                chartData={chartData}
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    if (chartType === "radar" && xAxisColumn && yAxisColumn) {
        return (
            <RadarChartComponent
                title={title}
                chartData={chartData}
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    // 其他图表类型的实现可以类似添加
    return (
        <Card className="h-[400px]">
            <CardContent className="flex items-center justify-center h-full p-4">
                不支持的图表类型或配置不完整
            </CardContent>
        </Card>
    );
};

export default ChartRenderer; 