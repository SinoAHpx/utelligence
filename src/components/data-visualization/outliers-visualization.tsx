"use client";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/shadcn/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { useOutliersStore } from "@/store";
import { Download, Filter, InfoIcon } from "lucide-react";
import {
	CartesianGrid,
	Cell,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export default function OutliersVisualization() {
	// Use Zustand store directly
	const {
		data,
		columnName,
		method,
		threshold,
		statistics,
		activeTab,
		setActiveTab,
		isLoading,
		chartData,
	} = useOutliersStore();

	// 格式化方法的详细信息
	const formatMethodDetails = () => {
		const { methodDetails } = statistics;
		if (!methodDetails) return [];

		const details = [];
		if (method === "zscore") {
			details.push({ name: "均值", value: methodDetails.mean?.toFixed(4) || "N/A" });
			details.push({ name: "标准差", value: methodDetails.stdDev?.toFixed(4) || "N/A" });
		} else if (method === "iqr") {
			details.push({ name: "Q1 (第一四分位数)", value: methodDetails.q1?.toFixed(4) || "N/A" });
			details.push({ name: "Q3 (第三四分位数)", value: methodDetails.q3?.toFixed(4) || "N/A" });
			details.push({ name: "IQR (四分位距)", value: methodDetails.iqr?.toFixed(4) || "N/A" });
		} else if (method === "percentile") {
			details.push({ name: "下限百分位", value: methodDetails.lowerPercentile || "N/A" });
			details.push({ name: "上限百分位", value: methodDetails.upperPercentile || "N/A" });
		}

		return details;
	};

	// 渲染散点图
	const renderScatterPlot = () => {
		if (chartData.length === 0) {
			return (
				<div className="flex items-center justify-center h-60">
					<p className="text-gray-500">暂无数据可视化</p>
				</div>
			);
		}

		return (
			<ResponsiveContainer width="100%" height={400}>
				<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="index" name="索引" type="number" domain={[0, "dataMax"]} />
					<YAxis dataKey="value" name={columnName} domain={["auto", "auto"]} />
					<Tooltip
						formatter={(value: any) => [value, columnName]}
						labelFormatter={(label) => `索引: ${label}`}
					/>
					<Legend />
					<ReferenceLine
						y={statistics.upperBound}
						stroke="red"
						strokeDasharray="3 3"
						label={{ value: `上边界: ${statistics.upperBound.toFixed(2)}`, position: "right" }}
					/>
					<ReferenceLine
						y={statistics.lowerBound}
						stroke="red"
						strokeDasharray="3 3"
						label={{ value: `下边界: ${statistics.lowerBound.toFixed(2)}`, position: "right" }}
					/>
					<Scatter name="数据点" data={chartData} fill="#8884d8">
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.isOutlier ? "#ff5252" : "#8884d8"} />
						))}
					</Scatter>
				</ScatterChart>
			</ResponsiveContainer>
		);
	};

	// 渲染表格数据
	const renderTable = () => {
		if (!data || data.length === 0) {
			return (
				<div className="flex items-center justify-center h-60">
					<p className="text-gray-500">暂无数据</p>
				</div>
			);
		}

		// 仅显示异常值记录
		const outliers = data.filter((item) => {
			const value = Number(item[columnName]);
			return value < statistics.lowerBound || value > statistics.upperBound;
		});

		if (outliers.length === 0) {
			return (
				<Alert>
					<AlertDescription>未检测到异常值</AlertDescription>
				</Alert>
			);
		}

		// 获取数据的所有列
		const columns = Object.keys(outliers[0]);

		return (
			<ScrollArea className="h-[400px]">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead key={col} className={col === columnName ? "font-bold" : ""}>
									{col}
									{col === columnName && <Badge className="ml-2 bg-red-500">异常列</Badge>}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{outliers.map((row, rowIndex) => (
							<TableRow key={`row-${rowIndex}`}>
								{columns.map((col) => (
									<TableCell
										key={`cell-${rowIndex}-${col}`}
										className={col === columnName ? "font-bold text-red-500" : ""}
									>
										{row[col]}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ScrollArea>
		);
	};

	if (isLoading) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>加载异常值分析...</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Skeleton className="h-[400px] w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>异常值分析: {columnName}</CardTitle>
						<CardDescription>
							使用{" "}
							{method === "zscore" ? "Z-Score" : method === "iqr" ? "IQR (四分位距)" : "百分位数"}{" "}
							方法检测异常值
							{method === "zscore" && `, 阈值: ${threshold}`}
							{method === "iqr" && `, 系数: ${threshold}`}
							{method === "percentile" && `, 百分位: ${threshold}`}
						</CardDescription>
					</div>
					<div className="flex space-x-2">
						<Button size="sm" variant="outline">
							<Download className="h-4 w-4 mr-1" />
							导出数据
						</Button>
						<Button size="sm" variant="outline">
							<Filter className="h-4 w-4 mr-1" />
							筛选
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<div className="flex justify-between items-center mb-2">
						<TabsList>
							<TabsTrigger value="chart">散点图</TabsTrigger>
							<TabsTrigger value="table">异常数据表</TabsTrigger>
							<TabsTrigger value="details">统计详情</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="chart">{renderScatterPlot()}</TabsContent>

					<TabsContent value="table">{renderTable()}</TabsContent>

					<TabsContent value="details">
						<div className="space-y-4">
							<Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
								<CardContent className="pt-4">
									<div className="flex items-center mb-2">
										<InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
										<h4 className="text-sm font-medium">异常值统计</h4>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-gray-500 mb-1">检测列</p>
											<p className="text-sm">{columnName}</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">检测方法</p>
											<p className="text-sm">
												{method === "zscore" && "Z-Score (标准分)"}
												{method === "iqr" && "IQR (四分位距)"}
												{method === "percentile" && "百分位数"}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">阈值</p>
											<p className="text-sm">{threshold}</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">分析结果</p>
											<p className="text-sm">
												检测到 {statistics.outlierCount} 个异常值 (占总数的{" "}
												{((statistics.outlierCount / statistics.totalCount) * 100).toFixed(2)}%)
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">下边界</p>
											<p className="text-sm">{statistics.lowerBound.toFixed(4)}</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">上边界</p>
											<p className="text-sm">{statistics.upperBound.toFixed(4)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
								<CardContent className="pt-4">
									<div className="flex items-center mb-2">
										<InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
										<h4 className="text-sm font-medium">方法详情</h4>
									</div>

									<div className="space-y-2">
										{formatMethodDetails().map((detail, index) => (
											<div key={index} className="flex justify-between">
												<span className="text-xs text-gray-500">{detail.name}</span>
												<span className="text-xs font-mono">{detail.value}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
