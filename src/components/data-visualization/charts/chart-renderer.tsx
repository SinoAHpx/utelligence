import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import type { ChartConfig, ChartType } from "@/types/chart-types";
import { Loader2 } from "lucide-react";
import React from "react";
import AreaChartComponent from "./area-chart";
import BarChartComponent from "./bar-chart";
import LineChartComponent from "./line-chart";
import PieChartComponent from "./pie-chart";
import RadarChartComponent from "./radar-chart";
import ScatterChartComponent from "./scatter-chart";

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
export const ChartRenderer: React.FC<ChartRendererProps> = React.memo(({ chartConfig }) => {
	const { chartType, processedData, title, xAxisColumn, yAxisColumn } = chartConfig;

	// Get the appropriate chart component based on type
	const ChartComponent = CHART_COMPONENTS[chartType as ChartType];

	if (!ChartComponent) {
		return (
			<Card className="h-[400px]">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm">{title || chartType}</CardTitle>
					<CardDescription className="text-xs">错误</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-[340px] p-4">
					不支持的图表类型: {chartType}
				</CardContent>
			</Card>
		);
	}

	// Check if data is still processing (processedData might be undefined or empty array initially)
	// Display a loading state
	if (!processedData) {
		return (
			<Card className="h-[400px]">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm">{title || chartType}</CardTitle>
					<CardDescription className="text-xs">
						X: {xAxisColumn || "..."}, Y: {yAxisColumn || "..."} - 正在加载数据...
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center h-[340px] p-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
					<p className="text-sm text-muted-foreground">正在处理图表数据</p>
				</CardContent>
			</Card>
		);
	}

	// --- Pass the full chartConfig to the specific component ---
	// The specific component (e.g., BarChartComponent) will handle its props
	return <ChartComponent chartConfig={chartConfig} />;
});

// Assign display name for better debugging
ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;
