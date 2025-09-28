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

interface DonutChartProps {
	chartConfig: ChartConfig;
}

const DonutChartComponent: FC<DonutChartProps> = ({ chartConfig }) => {
	const {
		title = "Donut Chart",
		processedData = [],
		yAxisColumn,
	} = chartConfig;

	const option = useMemo<EChartsCoreOption>(() => {
		const data = processedData.map((item, index) => ({
			value: Number(item.value ?? item[yAxisColumn ?? "value"] ?? 0),
			name: String(item.name ?? item.label ?? `类别${index + 1}`),
			itemStyle: { color: getChartColor(index) },
		}));

		return {
			tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
			legend: { orient: "horizontal", bottom: 0 },
			series: [
				{
					type: "pie",
					radius: ["55%", "85%"],
					center: ["50%", "45%"],
					avoidLabelOverlap: false,
					itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: "#fff" },
					label: { show: true, formatter: "{b}\n{d}%" },
					labelLine: { length: 18, length2: 12 },
					data,
				},
			],
		};
	}, [processedData, yAxisColumn]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">
					列: {yAxisColumn || "未选择"}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">暂无环形图数据</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

DonutChartComponent.displayName = "DonutChartComponent";

export default DonutChartComponent;
