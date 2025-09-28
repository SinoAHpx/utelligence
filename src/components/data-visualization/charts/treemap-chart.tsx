"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import type { ChartConfig } from "@/types/chart-types";
import type { EChartsCoreOption } from "echarts";
import { useMemo, type FC } from "react";
import BaseEChart from "./base-echart";
import { getChartColor } from "@/utils/constants/chart-colors";

interface TreemapChartProps {
	chartConfig: ChartConfig;
}

const TreemapChartComponent: FC<TreemapChartProps> = ({ chartConfig }) => {
	const {
		title = "Treemap Chart",
		processedData = [],
		yAxisColumn,
	} = chartConfig;

	const option = useMemo<EChartsCoreOption>(() => {
		const data = processedData.map((item, index) => ({
			name: String(item.name ?? item.label ?? `类别${index + 1}`),
			value: Number(item.value ?? item[yAxisColumn ?? "value"] ?? 0),
			itemStyle: { color: getChartColor(index) },
		}));

		return {
			tooltip: {
				trigger: "item",
				formatter: (params: any) => `${params.name}: ${params.value}`,
			},
			series: [
				{
					type: "treemap",
					breadcrumb: { show: false },
					roam: false,
					label: { formatter: "{b}\n{c}" },
					upperLabel: { show: true, height: 24 },
					leafDepth: 1,
					data,
				},
			],
		};
	}, [processedData, yAxisColumn]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">分类列: {yAxisColumn || "未选择"}</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">暂无矩形树图数据</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

TreemapChartComponent.displayName = "TreemapChartComponent";

export default TreemapChartComponent;
