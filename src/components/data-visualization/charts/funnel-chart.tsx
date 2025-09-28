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

interface FunnelChartProps {
	chartConfig: ChartConfig;
}

const FunnelChartComponent: FC<FunnelChartProps> = ({ chartConfig }) => {
	const {
		title = "Funnel Chart",
		processedData = [],
		yAxisColumn,
	} = chartConfig;

	const option = useMemo<EChartsCoreOption>(() => {
		const baseData = processedData.map((item, index) => ({
			value: Number(item.value ?? item[yAxisColumn ?? "value"] ?? 0),
			name: String(item.name ?? item.label ?? `阶段${index + 1}`),
		}));

		const sortedData = baseData
			.map((entry, index) => ({ ...entry, itemStyle: { color: getChartColor(index) } }))
			.sort((a, b) => b.value - a.value);

		return {
			tooltip: { trigger: "item", formatter: "{b}: {c}" },
			legend: { orient: "horizontal", bottom: 0 },
			series: [
				{
					type: "funnel",
					top: "5%",
					bottom: "20%",
					left: "10%",
					width: "80%",
					minSize: "20%",
					maxSize: "90%",
					label: { formatter: "{b}\n{c}" },
					labelLine: { length: 20, lineStyle: { width: 1 } },
					data: sortedData,
				},
			],
		};
	}, [processedData, yAxisColumn]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">阶段列: {yAxisColumn || "未选择"}</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">暂无漏斗图数据</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

FunnelChartComponent.displayName = "FunnelChartComponent";

export default FunnelChartComponent;
