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

interface RadarChartComponentProps {
	chartConfig: ChartConfig;
}

const RadarChartComponent: FC<RadarChartComponentProps> = ({ chartConfig }) => {
	const {
		title = "Radar Chart",
		processedData = [],
		xAxisColumn,
		isTruncated = false,
	} = chartConfig;

	const option = useMemo<EChartsCoreOption>(() => {
		const maxValue = processedData.reduce((max, item) => {
			const current = Number(item.value ?? 0);
			return current > max ? current : max;
		}, 0);

		const indicators = processedData.map((item) => ({
			name: String(item.subject ?? item.name ?? "类别"),
			max: maxValue || 1,
		}));

		const values = processedData.map((item) => Number(item.value ?? 0));

		return {
			tooltip: { trigger: "item" },
			radar: {
				indicator: indicators,
				shape: "circle",
				radius: "65%",
				splitNumber: 5,
				splitArea: {
					areaStyle: {
						color: ["rgba(136, 132, 216, 0.1)", "rgba(130, 202, 157, 0.1)"]
					},
				},
				splitLine: { lineStyle: { color: "rgba(136, 132, 216, 0.3)" } },
				axisName: { color: "var(--muted-foreground)" },
			},
			series: [
				{
					name: title,
					type: "radar",
					areaStyle: { opacity: 0.25, color: getChartColor(0) },
					lineStyle: { color: getChartColor(0) },
					itemStyle: { color: getChartColor(0) },
					data: [values],
				},
			],
		};
	}, [processedData, title]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">
					分类列: {xAxisColumn || "N/A"}
					{isTruncated && " (已截断)"}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">暂无雷达图数据</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

RadarChartComponent.displayName = "RadarChartComponent";

export default RadarChartComponent;
