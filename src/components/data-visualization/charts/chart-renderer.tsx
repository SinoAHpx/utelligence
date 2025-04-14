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
    chartConfig
}) => {
    const {
        chartType
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
};

export default ChartRenderer; 