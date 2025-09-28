// Chart data structure
export interface ChartDataItem {
	[key: string]: string | number;
}

// Base props for all chart components
export interface ChartProps {
	title: string;
	chartData: ChartDataItem[];
}

// Supported chart types
export type ChartType =
	| "bar"
	| "line"
	| "area"
	| "pie"
	| "scatter"
	| "radar"
	| "donut"
	| "funnel"
	| "treemap";

// Chart configuration type definitions
export interface ChartConfig {
	id: string;
	chartType: ChartType; // e.g., 'bar', 'line'
	title: string;
	xAxisColumn?: string; // Original selected X column name
	yAxisColumn?: string; // Original selected Y column name (single)

	// Processed data and layout specific to this chart instance
	processedData?: ChartDataItem[];
	layout?: "stacked" | "simple" | "grouped"; // Layout for bar charts
	yCategories?: string[]; // Keys for stacked bar/area/line data
	yKey?: string; // Key for simple/grouped bar chart data

	// Line/Area/Scatter specific fields based on single yAxisColumn analysis
	numericYKey?: string; // The dataKey for a single numeric Y line/area -> Use yAxisColumn directly?

	// Performance flag
	isTruncated?: boolean;
}

// Chart type definition with metadata
export interface ChartTypeDefinition {
	id: ChartType;
	name: string;
	description: string;
	requiresColumns: number;
	requiresAxis: boolean;
}

// Chart type options for display
export const CHART_TYPES: ChartTypeDefinition[] = [
	{
		id: "bar",
		name: "柱状图",
		description: "适合展示分类数据对比",
		requiresColumns: 2,
		requiresAxis: true,
	},
	{
		id: "line",
		name: "线形图",
		description: "适合展示连续数据的趋势",
		requiresColumns: 2,
		requiresAxis: true,
	},
	{
		id: "area",
		name: "面积图",
		description: "适合展示数量随时间的变化趋势",
		requiresColumns: 2,
		requiresAxis: true,
	},
	{
		id: "pie",
		name: "饼图",
		description: "适合展示比例分布",
		requiresColumns: 1,
		requiresAxis: false,
	},
	{
		id: "donut",
		name: "环形图",
		description: "凸显整体中各部分的占比",
		requiresColumns: 1,
		requiresAxis: false,
	},
	{
		id: "funnel",
		name: "漏斗图",
		description: "展示流程各阶段的转化情况",
		requiresColumns: 1,
		requiresAxis: false,
	},
	{
		id: "treemap",
		name: "矩形树图",
		description: "通过面积突出分类结构和占比",
		requiresColumns: 1,
		requiresAxis: false,
	},
	{
		id: "scatter",
		name: "散点图",
		description: "适合展示数据分布和相关性",
		requiresColumns: 2,
		requiresAxis: true,
	},
	{
		id: "radar",
		name: "雷达图",
		description: "适合多维度数据比较",
		requiresColumns: 3,
		requiresAxis: true,
	},
];
