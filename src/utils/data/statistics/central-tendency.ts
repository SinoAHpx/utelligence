import * as ss from "simple-statistics";
import { CATEGORIES, type CellValue, type StatisticResult } from "./types";
import { convertToNumericArray } from "./utils";

/**
 * 算术平均数 (Arithmetic Mean)
 */
export function mean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return ss.mean(numericData);
}

/**
 * 几何平均数 (Geometric Mean)
 */
export function geometricMean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;

	// Geometric mean only works with positive numbers
	const positiveData = numericData.filter((num) => num > 0);
	if (positiveData.length === 0) return null;

	return ss.geometricMean(positiveData);
}

/**
 * 调和平均数 (Harmonic Mean)
 */
export function harmonicMean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;

	// Harmonic mean only works with non-zero numbers
	const nonZeroData = numericData.filter((num) => num !== 0);
	if (nonZeroData.length === 0) return null;

	return ss.harmonicMean(nonZeroData);
}

/**
 * 中位数 (Median)
 */
export function median(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return ss.median(numericData);
}

/**
 * 众数 (Mode) - can return multiple values
 */
export function mode(data: CellValue[]): (string | number)[] {
	const cleanedData = data.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
	if (cleanedData.length === 0) return [];

	// Count frequencies
	const freqMap: Record<string, number> = {};
	cleanedData.forEach((val) => {
		const key = String(val);
		freqMap[key] = (freqMap[key] || 0) + 1;
	});

	// Find the maximum frequency
	let maxFreq = 0;
	for (const key in freqMap) {
		if (freqMap[key] > maxFreq) {
			maxFreq = freqMap[key];
		}
	}

	// Return all values that have the maximum frequency
	const modes: (string | number)[] = [];
	for (const key in freqMap) {
		if (freqMap[key] === maxFreq) {
			// Convert back to number if it was numeric
			const numVal = Number(key);
			modes.push(isNaN(numVal) ? key : numVal);
		}
	}

	return modes;
}

/**
 * 获取所有集中趋势测度的统计量
 */
export function getCentralTendencyStatistics(data: CellValue[]): StatisticResult[] {
	return [
		{
			name: "平均值 (Mean)",
			value: mean(data),
			category: CATEGORIES.CENTRAL_TENDENCY,
		},
		{
			name: "几何平均数 (Geometric Mean)",
			value: geometricMean(data),
			category: CATEGORIES.CENTRAL_TENDENCY,
		},
		{
			name: "调和平均数 (Harmonic Mean)",
			value: harmonicMean(data),
			category: CATEGORIES.CENTRAL_TENDENCY,
		},
		{
			name: "中位数 (Median)",
			value: median(data),
			category: CATEGORIES.CENTRAL_TENDENCY,
		},
		{
			name: "众数 (Mode)",
			value: mode(data),
			category: CATEGORIES.CENTRAL_TENDENCY,
		},
	];
}
