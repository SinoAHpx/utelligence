"use client";

import { getChartColor } from "@/utils/constants/chart-colors";
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

interface LineChartComponentProps {
	chartConfig: ChartConfig;
}

const LineChartComponent: FC<LineChartComponentProps> = ({ chartConfig }) => {
	const {
		title = "Line Chart",
		processedData = [],
		xAxisColumn,
		yAxisColumn,
		yCategories = [],
		numericYKey,
		isTruncated = false,
	} = chartConfig;

	const isMultiLineTrend = yCategories && yCategories.length > 0 && processedData.length > 0;

	const description = `X: ${xAxisColumn || "N/A"}${isMultiLineTrend ? `, Y: Count of ${yAxisColumn || "N/A"} Categories` : yAxisColumn ? `, Y: ${yAxisColumn}` : ""}`;

	const option = useMemo<EChartsCoreOption>(() => {
		const xField = xAxisColumn ?? "index";
		const xCategories = processedData.map((item) => String(item[xField] ?? ""));

		const series = isMultiLineTrend
			? yCategories.map((category, index) => ({
				name: category,
				type: "line",
				smooth: true,
				showSymbol: true,
				symbolSize: 6,
				lineStyle: { width: 2 },
				itemStyle: { color: getChartColor(index) },
				data: processedData.map((row) => Number(row[category] ?? 0)),
			}))
			: [
				{
					name: yAxisColumn || numericYKey || "值",
					type: "line",
					smooth: true,
					showSymbol: true,
					symbolSize: 6,
					itemStyle: { color: getChartColor(0) },
					lineStyle: { width: 2 },
					data: processedData.map((row) => Number(row[(numericYKey ?? yAxisColumn) ?? "value"] ?? 0)),
				},
			];

		return {
			tooltip: { trigger: "axis" },
			legend: { top: 0 },
			grid: { left: 56, right: 24, top: 40, bottom: 80 },
			xAxis: {
				type: "category",
				data: xCategories,
				axisLabel: { rotate: 45, align: "right" },
			},
			yAxis: {
				type: "value",
				splitLine: { lineStyle: { type: "dashed" } },
				axisLine: { show: false },
			},
			series,
		};
	}, [isMultiLineTrend, numericYKey, processedData, xAxisColumn, yAxisColumn, yCategories]);

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs flex items-center">
					{description}
					{isTruncated && (
						<span
							className="ml-2 text-amber-600 dark:text-amber-400 flex items-center"
							title="数据点过多，已截断显示"
						>
							(已截断)
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				{processedData.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						暂无数据
					</div>
				) : (
					<BaseEChart option={option} style={{ height: "100%" }} />
				)}
			</CardContent>
		</Card>
	);
};

LineChartComponent.displayName = "LineChartComponent";

export default LineChartComponent;
