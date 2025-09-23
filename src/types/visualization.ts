import type { ChartType } from "@/types/chart-types";

export interface ColumnVisualizableConfig {
	column: string;
	isVisualizable: boolean;
	uniqueValues: number;
	totalValues: number;
	reason?: string;
}

export interface ChartBuilderState {
	chartType: ChartType;
	title: string;
	xAxis: string | null;
	yAxis: string | null;
}
