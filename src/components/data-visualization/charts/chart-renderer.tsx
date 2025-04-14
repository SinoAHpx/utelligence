import type React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartConfig, ChartDataItem, ChartType } from "@/types/chart-types";
import PieChartComponent from "./pie-chart";
import BarChartComponent from "./bar-chart";
import LineChartComponent from "./line-chart";
import ScatterChartComponent from "./scatter-chart";
import AreaChartComponent from "./area-chart";
import RadarChartComponent from "./radar-chart";

interface ChartRendererProps {
    chartConfig: ChartConfig;
    onRemoveChart?: (chartId: string) => void;
}

/**
 * Chart component mapping
 * Maps chart types to their respective components
 */
const CHART_COMPONENTS: Record<ChartType, React.FC<any>> = {
    pie: PieChartComponent,
    bar: BarChartComponent,
    line: LineChartComponent,
    scatter: ScatterChartComponent,
    area: AreaChartComponent,
    radar: RadarChartComponent,
};

/**
 * ChartRenderer - Renders the appropriate chart based on configuration
 * Handles different chart types and their specific data requirements
 */
export const ChartRenderer: React.FC<ChartRendererProps> = ({
    chartConfig,
    onRemoveChart,
}) => {
    const {
        chartType,
        columns,
        title,
        xAxisColumn,
        yAxisColumn,
        duplicateValueHandling = "merge"
    } = chartConfig;

    // Get the appropriate chart component based on type
    const ChartComponent = CHART_COMPONENTS[chartType as ChartType];

    if (!ChartComponent) {
        return (
            <Card className="h-[400px]">
                <CardContent className="flex items-center justify-center h-full p-4">
                    不支持的图表类型: {chartType}
                </CardContent>
            </Card>
        );
    }

    // Check if the chart has processed data
    if (!chartConfig.processedData || chartConfig.processedData.length === 0) {
        return (
            <Card className="h-[400px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{chartConfig.title || chartType}</CardTitle>
                    <CardDescription className="text-xs">
                        Waiting for data or configuration...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-full p-4">
                    No data processed for this chart yet.
                    {/* Optionally add a remove button here */}
                </CardContent>
            </Card>
        );
    }

    // --- Pass the full chartConfig to the specific component ---
    // The specific component (e.g., BarChartComponent) will handle its props
    return <ChartComponent chartConfig={chartConfig} />;

    /* --- Old Logic (for reference, now handled within specific components) ---
    // 饼图只需要一列数据
    if (chartType === "pie" && columns.length > 0) {
        const dataColumn = columns[0];
        return (
            <PieChartComponent
                title={title}
                chartData={chartData} // Needs update if PieChart uses processedData
                dataColumn={dataColumn}
                duplicateValueHandling={duplicateValueHandling}
            />
        );
    }

    // 雷达图需要多列数据（至少3列）
    if (chartType === "radar" && columns.length >= 3) {
        return (
            <RadarChartComponent
                title={title}
                chartData={chartData} // Needs update
                xAxisColumn={xAxisColumn || columns[0]}
                yAxisColumn={yAxisColumn || columns[1]}
                columns={columns}
            />
        );
    }

    // 对于需要x轴和y轴的图表
    if (chartType !== "pie" && xAxisColumn && yAxisColumn) {
        return (
            <ChartComponent
                title={title}
                chartData={chartData} // Needs update
                xAxisColumn={xAxisColumn}
                yAxisColumn={yAxisColumn}
            />
        );
    }

    // 配置不完整
    return (
        <Card className="h-[400px]">
            <CardContent className="flex items-center justify-center h-full p-4">
                图表配置不完整，请检查X轴和Y轴设置
            </CardContent>
        </Card>
    );
    */
};

export default ChartRenderer; 