import { CATEGORIES, type CellValue, type StatisticResult } from "./types";
import { convertToNumericArray } from "./utils";

/**
 * 最小值 (Minimum)
 */
export function min(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.min(...numericData);
}

/**
 * 最大值 (Maximum)
 */
export function max(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.max(...numericData);
}

/**
 * 有效数据量 (Count)
 */
export function count(data: CellValue[]): number {
	return convertToNumericArray(data).length;
}

/**
 * 获取所有基本统计量
 */
export function getBasicStatistics(data: CellValue[]): StatisticResult[] {
	return [
		{ name: "最小值 (Minimum)", value: min(data), category: CATEGORIES.BASIC },
		{ name: "最大值 (Maximum)", value: max(data), category: CATEGORIES.BASIC },
		{
			name: "样本数量 (Count)",
			value: count(data),
			category: CATEGORIES.BASIC,
		},
	];
}
