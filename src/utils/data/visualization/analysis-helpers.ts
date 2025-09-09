import {
	kurtosis,
	max,
	mean,
	median,
	min,
	mode,
	skewness,
	standardDeviation,
	variance,
} from "@/utils/data/statistics";
import type { CellValue, StatisticResult } from "@/utils/data/statistics/types";

/**
 * 提取数值型数据
 */
export function extractNumericData(data: CellValue[]): number[] {
	// Common invalid value representations
	const invalidValues = ["n/a", "na", "null", "undefined", "-", "nan", "#n/a", "#null", "#value!"];

	return data
		.filter((v) => {
			// Skip null, undefined, or empty values
			if (v === null || v === undefined) return false;

			// Handle numeric types directly
			if (typeof v === "number") return !isNaN(v);

			const strValue = String(v).trim().toLowerCase();

			// Skip empty strings and common invalid value representations
			if (strValue === "" || invalidValues.includes(strValue)) return false;

			// Check if it can be converted to a valid number
			return !isNaN(Number(strValue));
		})
		.map((v) => (typeof v === "number" ? v : Number(v)));
}

/**
 * 格式化统计值用于显示
 */
export function formatStatValue(value: any): string {
	if (value === null) return "N/A";
	if (Array.isArray(value)) {
		if (value.length === 0) return "N/A";
		return value.join(", ");
	}
	if (typeof value === "number") {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 4,
			minimumFractionDigits: 0,
		});
	}
	return String(value);
}

/**
 * 获取中心趋势指标
 */
export function getCentralTendencyMetrics(data: CellValue[]) {
	const numericData = extractNumericData(data);

	if (numericData.length === 0) {
		return null;
	}

	return {
		mean: mean(numericData),
		median: median(numericData),
		mode: mode(numericData),
		count: numericData.length,
		min: min(numericData),
		max: max(numericData),
	};
}

/**
 * 获取离散程度指标
 */
export function getDispersionMetrics(data: CellValue[]) {
	const numericData = extractNumericData(data);

	if (numericData.length === 0) {
		return null;
	}

	return {
		variance: variance(numericData),
		standardDeviation: standardDeviation(numericData),
	};
}

/**
 * 获取分布形态指标
 */
export function getDistributionMetrics(data: CellValue[]) {
	const numericData = extractNumericData(data);

	if (numericData.length === 0) {
		return null;
	}

	// 确保至少有4个有效数据点（计算峰度所需）
	if (numericData.length < 4) {
		return {
			skewness: null,
			kurtosis: null,
		};
	}

	return {
		skewness: skewness(numericData),
		kurtosis: kurtosis(numericData),
	};
}

/**
 * 按类别分组统计数据
 */
export function groupStatsByCategory(stats: StatisticResult[]): Record<string, StatisticResult[]> {
	return stats.reduce((acc: Record<string, StatisticResult[]>, stat) => {
		if (!acc[stat.category]) {
			acc[stat.category] = [];
		}
		acc[stat.category].push(stat);
		return acc;
	}, {});
}
