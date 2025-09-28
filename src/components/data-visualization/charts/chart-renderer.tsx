"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import type { ChartConfig, ChartType } from "@/types/chart-types";
import { Loader2 } from "lucide-react";
import { memo, type FC } from "react";
import AreaChartComponent from "./area-chart";
import BarChartComponent from "./bar-chart";
import LineChartComponent from "./line-chart";
import PieChartComponent from "./pie-chart";
import DonutChartComponent from "./donut-chart";
import FunnelChartComponent from "./funnel-chart";
import TreemapChartComponent from "./treemap-chart";
import RadarChartComponent from "./radar-chart";
import ScatterChartComponent from "./scatter-chart";

interface ChartRendererProps {
	chartConfig: ChartConfig;
	onRemoveChart?: (chartId: string) => void;
}

const CHART_COMPONENTS: Record<ChartType, FC<any>> = {
	pie: PieChartComponent,
	donut: DonutChartComponent,
	funnel: FunnelChartComponent,
	treemap: TreemapChartComponent,
	bar: BarChartComponent,
	line: LineChartComponent,
	scatter: ScatterChartComponent,
	area: AreaChartComponent,
	radar: RadarChartComponent,
};

const ChartRendererComponent: FC<ChartRendererProps> = memo(({ chartConfig }) => {
	const { chartType, processedData, title, xAxisColumn, yAxisColumn } = chartConfig;

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

	return <ChartComponent chartConfig={chartConfig} />;
});

ChartRendererComponent.displayName = "ChartRenderer";

export const ChartRenderer = ChartRendererComponent;

export default ChartRendererComponent;
