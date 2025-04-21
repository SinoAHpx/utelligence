import * as ss from "simple-statistics";
import { CellValue, CATEGORIES, StatisticResult } from "./types";
import { convertToNumericArray } from "./utils";

/**
 * 方差 (Variance)
 */
export function variance(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null; // Need at least 2 values for variance
	return ss.variance(numericData);
}

/**
 * 标准差 (Standard Deviation)
 */
export function standardDeviation(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null; // Need at least 2 values for std dev
	return ss.standardDeviation(numericData);
}

/**
 * 极差 (Range)
 */
export function range(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.max(...numericData) - Math.min(...numericData);
}

/**
 * 四分位距 (Interquartile Range, IQR)
 */
export function interquartileRange(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null; // Need a reasonable number of values for IQR

	const q1 = ss.quantile(numericData, 0.25);
	const q3 = ss.quantile(numericData, 0.75);
	return q3 - q1;
}

/**
 * 平均绝对离差 (Mean Absolute Deviation, MAD)
 */
export function meanAbsoluteDeviation(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;

	// Calculate the mean first
	const meanValue = ss.mean(numericData);

	// Calculate the mean of absolute deviations from the mean
	const absoluteDeviations = numericData.map((val) =>
		Math.abs(val - meanValue),
	);
	return ss.mean(absoluteDeviations);
}

/**
 * 变异系数 (Coefficient of Variation, CV)
 */
export function coefficientOfVariation(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null;

	const mean = ss.mean(numericData);
	if (mean === 0) return null; // Avoid division by zero

	const stdDev = ss.standardDeviation(numericData);
	return stdDev / mean;
}

/**
 * 方差系数 (Coefficient of Dispersion)
 */
export function coefficientOfDispersion(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null;

	const variance = ss.variance(numericData);
	const mean = ss.mean(numericData);

	if (mean === 0) return null; // Avoid division by zero
	return variance / mean;
}

/**
 * 基尼系数 (Gini Coefficient)
 */
export function giniCoefficient(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null;

	// Sort the data
	const sortedData = [...numericData].sort((a, b) => a - b);

	// Calculate the Gini coefficient
	let sumNumerator = 0;
	const n = sortedData.length;

	for (let i = 0; i < n; i++) {
		sumNumerator += (2 * (i + 1) - n - 1) * sortedData[i];
	}

	const sumDenominator = n * sortedData.reduce((a, b) => a + b, 0);

	if (sumDenominator === 0) return null; // Avoid division by zero
	return sumNumerator / sumDenominator;
}

/**
 * 获取所有离散程度测度的统计量
 */
export function getDispersionStatistics(data: CellValue[]): StatisticResult[] {
	return [
		{
			name: "方差 (Variance)",
			value: variance(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "标准差 (Standard Deviation)",
			value: standardDeviation(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "极差 (Range)",
			value: range(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "四分位距 (IQR)",
			value: interquartileRange(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "平均绝对离差 (MAD)",
			value: meanAbsoluteDeviation(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "变异系数 (CV)",
			value: coefficientOfVariation(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "方差系数 (Coefficient of Dispersion)",
			value: coefficientOfDispersion(data),
			category: CATEGORIES.DISPERSION,
		},
		{
			name: "基尼系数 (Gini Coefficient)",
			value: giniCoefficient(data),
			category: CATEGORIES.DISPERSION,
		},
	];
}
