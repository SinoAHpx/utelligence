// Chart data structure
export interface ChartDataItem {
	[key: string]: string | number;
}

// Base props for all chart components
export interface ChartProps {
	title: string;
	chartData: ChartDataItem[];
}

// Chart configuration type definitions
export interface ChartConfig {
	id: string;
	columns: string[];
	chartType: string;
	title: string;
	xAxisColumn?: string;
	yAxisColumn?: string;
	duplicateValueHandling?: "merge" | "keep";
}

// Supported chart types
export type ChartType = "bar" | "line" | "area" | "pie" | "scatter" | "radar";

// Chart type definition with metadata
export interface ChartTypeDefinition {
	id: ChartType;
	name: string;
	description: string;
	requiresColumns: number;
	requiresAxis: boolean;
	maxDataPoints?: number;
	colorDescription?: string;
}

// Chart type options for display
export const CHART_TYPES: ChartTypeDefinition[] = [
	{
		id: "bar",
		name: "柱状图",
		description: "适合展示分类数据对比",
		requiresColumns: 2,
		requiresAxis: true,
		maxDataPoints: 50,
		colorDescription:
			"<span class='text-blue-600 font-medium'>最多展示50个数据点</span>，需要选择2列数据作为X轴和Y轴。",
	},
	{
		id: "line",
		name: "线形图",
		description: "适合展示连续数据的趋势",
		requiresColumns: 2,
		requiresAxis: true,
		maxDataPoints: 100,
		colorDescription:
			"<span class='text-green-600 font-medium'>最多展示100个数据点</span>，需要选择2列数据作为X轴和Y轴。",
	},
	{
		id: "area",
		name: "面积图",
		description: "适合展示数量随时间的变化趋势",
		requiresColumns: 2,
		requiresAxis: true,
		maxDataPoints: 100,
		colorDescription:
			"<span class='text-purple-600 font-medium'>最多展示100个数据点</span>，需要选择2列数据作为X轴和Y轴。",
	},
	{
		id: "pie",
		name: "饼图",
		description: "适合展示比例分布",
		requiresColumns: 1,
		requiresAxis: false,
		maxDataPoints: 10,
		colorDescription:
			"<span class='text-red-600 font-medium'>最多展示10个数据点</span>，需要选择1列数据，自动合并和计算比例。",
	},
	{
		id: "scatter",
		name: "散点图",
		description: "适合展示数据分布和相关性",
		requiresColumns: 2,
		requiresAxis: true,
		maxDataPoints: 50,
		colorDescription:
			"<span class='text-amber-600 font-medium'>最多展示50个数据点</span>，需要选择2列数据作为X轴和Y轴。",
	},
	{
		id: "radar",
		name: "雷达图",
		description: "适合多维度数据比较",
		requiresColumns: 3,
		requiresAxis: true,
		maxDataPoints: 10,
		colorDescription:
			"<span class='text-emerald-600 font-medium'>最多展示10个数据项</span>，需要选择至少3列数据作为多维比较指标。",
	},
];
