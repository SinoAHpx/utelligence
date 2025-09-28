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

interface ScatterChartComponentProps {
	chartConfig: ChartConfig;
}

const ScatterChartComponent: FC<ScatterChartComponentProps> = ({ chartConfig }) => {
	const {
		title = "Scatter Chart",
		processedData = [],
		xAxisColumn,
		yAxisColumn,
		isTruncated = false,
	} = chartConfig;

	const option = useMemo<EChartsCoreOption>(() => {
		const points = processedData.map((item) => [
			Number(item[xAxisColumn ?? "x"] ?? 0),
			Number(item[yAxisColumn ?? "y"] ?? 0),
		]);

		return {
			tooltip: {
				trigger: "item",
				formatter: (params: any) => {
					const [x, y] = params.value as [number, number];
					return `${xAxisColumn || "X"}: ${x}<br/>${yAxisColumn || "Y"}: ${y}`;
				},
			},
			xAxis: {
				name: xAxisColumn || "X",
				type: "value",
				splitLine: { lineStyle: { type: "dashed" } },
			},
			yAxis: {
				name: yAxisColumn || "Y",
				type: "value",
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: `${yAxisColumn || "Y"} vs ${xAxisColumn || "X"}`,
					type: "scatter",
					symbolSize: 10,
					itemStyle: { color: getChartColor(0) },
					data: points,
				},
			],
		};
	}, [processedData, xAxisColumn, yAxisColumn]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">
					X: {xAxisColumn || "N/A"}, Y: {yAxisColumn || "N/A"}
					{isTruncated && " (已截断)"}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">暂无散点数据</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

ScatterChartComponent.displayName = "ScatterChartComponent";

export default ScatterChartComponent;
