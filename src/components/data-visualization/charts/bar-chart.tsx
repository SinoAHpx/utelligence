import { getChartColor } from "@/components/constants/chart-colors";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import type { ChartConfig } from "@/types/chart-types";
import { AlertTriangle } from "lucide-react";
import React from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface BarChartComponentProps {
	chartConfig: ChartConfig;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ chartConfig }) => {
	const {
		title = "Bar Chart",
		processedData = [],
		xAxisColumn,
		yAxisColumn,
		layout = "simple",
		yCategories = [],
		yKey = "count",
		isTruncated = false,
	} = chartConfig;

	const categoryDataKey = "name";

	const description = `X: ${xAxisColumn || "N/A"}, Y: ${yAxisColumn || "N/A"} (${layout === "stacked" ? "Stacked" : "Simple"} Count)`;

	if (!processedData || processedData.length === 0) {
		return (
			<Card className="h-[400px]">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm">{title}</CardTitle>
					<CardDescription className="text-xs">{description} - 正在等待数据...</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-[340px]">
					<p className="text-muted-foreground">没有可用于柱状图的数据。</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs flex items-center">
					{description}
					{isTruncated && (
						<span
							className="ml-2 flex items-center text-amber-600 dark:text-amber-400"
							title="数据点过多，已截断显示"
						>
							<AlertTriangle size={12} className="mr-1" />
							(已截断)
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[340px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey={categoryDataKey}
							type="category"
							angle={-45}
							textAnchor="end"
							interval={0}
							height={60}
						/>
						<YAxis type="number" />
						<Tooltip />
						<Legend />
						{layout === "stacked" ? (
							yCategories.map((category: string, index: number) => (
								<Bar
									key={category}
									dataKey={category}
									stackId="a"
									fill={getChartColor(index)}
									name={category}
								/>
							))
						) : (
							<Bar dataKey={yKey} fill={getChartColor(0)} name={yAxisColumn || yKey} />
						)}
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
};

BarChartComponent.displayName = "BarChartComponent";

export default React.memo(BarChartComponent);
