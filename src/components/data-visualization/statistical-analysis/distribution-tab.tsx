"use client";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/shadcn/table";
import type { CellValue } from "@/utils/data/statistics/types";
import {
	formatStatValue,
	getDistributionMetrics,
} from "../../../utils/data/visualization/analysis-helpers";

interface DistributionTabProps {
	data: CellValue[];
	columnName: string;
}

/**
 * 分布形态分析标签页组件
 */
export function DistributionTab({ data, columnName }: DistributionTabProps) {
	// 检查数据是否为空
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-40">
				<p className="text-gray-500">暂无数据可供分析</p>
			</div>
		);
	}

	// 使用helper函数获取分布形态指标
	const metrics = getDistributionMetrics(data);

	// 检查是否有足够数值数据
	if (!metrics) {
		return (
			<Alert>
				<AlertDescription>所选列 {columnName} 不包含数值数据，无法分析分布形态。</AlertDescription>
			</Alert>
		);
	}

	// 检查是否有足够数据计算峰度和偏度
	if (metrics.skewness === null && metrics.kurtosis === null) {
		return (
			<Alert>
				<AlertDescription>
					所选列 {columnName} 数据点不足，无法可靠计算分布形态指标。需要至少四个数据点。
				</AlertDescription>
			</Alert>
		);
	}

	// 获取偏度描述
	const getSkewnessDescription = (skew: number | null) => {
		if (skew === null) return "无法计算";
		if (Math.abs(skew) < 0.5) return "近似对称";
		return skew > 0 ? "正偏（右尾较长）" : "负偏（左尾较长）";
	};

	// 获取峰度描述
	const getKurtosisDescription = (kurt: number | null) => {
		if (kurt === null) return "无法计算";
		if (Math.abs(kurt) < 0.5) return "近似正态分布";
		return kurt > 0 ? "尖峰分布（比正态分布更集中）" : "平峰分布（比正态分布更分散）";
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{columnName} 的分布形态分析</CardTitle>
				<CardDescription>展示数据分布的形状特征</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>指标</TableHead>
							<TableHead>值</TableHead>
							<TableHead>描述</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">偏度</TableCell>
							<TableCell>{formatStatValue(metrics.skewness)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{getSkewnessDescription(metrics.skewness)}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">峰度</TableCell>
							<TableCell>{formatStatValue(metrics.kurtosis)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{getKurtosisDescription(metrics.kurtosis)}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
