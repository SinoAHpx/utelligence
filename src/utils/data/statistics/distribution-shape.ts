import * as ss from "simple-statistics";
import { CellValue, CATEGORIES, StatisticResult } from "./types";
import { convertToNumericArray, chiSquareCDF, formatJarqueBera } from "./utils";

/**
 * Fisher 偏度 (Fisher Skewness)
 */
export function fisherSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 3) return null; // Need at least 3 values for skewness
	return ss.sampleSkewness(numericData);
}

/**
 * Pearson 偏度 (Pearson Skewness)
 */
export function pearsonSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 3) return null;

	const mean = ss.mean(numericData);
	const median = ss.median(numericData);
	const stdDev = ss.standardDeviation(numericData);

	if (stdDev === 0) return null; // Avoid division by zero
	return (3 * (mean - median)) / stdDev;
}

/**
 * 四分位数偏度 (Quartile Skewness)
 */
export function quartileSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null;

	const q1 = ss.quantile(numericData, 0.25);
	const q2 = ss.quantile(numericData, 0.5); // median
	const q3 = ss.quantile(numericData, 0.75);

	if (q3 - q1 === 0) return null; // Avoid division by zero
	return (q3 - q2 - (q2 - q1)) / (q3 - q1);
}

/**
 * Fisher 峰度 / 超额峰度 (Fisher Kurtosis / Excess Kurtosis)
 */
export function fisherKurtosis(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null; // Need at least 4 values for kurtosis
	return ss.sampleKurtosis(numericData);
}

/**
 * Pearson 峰度 / 原始峰度 (Pearson Kurtosis / Raw Kurtosis)
 */
export function pearsonKurtosis(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null;

	// Pearson Kurtosis = Fisher Kurtosis + 3
	const fisherKurt = ss.sampleKurtosis(numericData);
	return fisherKurt + 3;
}

/**
 * Jarque-Bera 检验 (用于评估正态性)
 */
export function jarqueBera(data: CellValue[]): {
	statistic: number | null;
	pValue: number | null;
	isNormal: boolean | null;
} {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 8) {
		// Need a reasonable sample size for meaningful results
		return { statistic: null, pValue: null, isNormal: null };
	}

	const n = numericData.length;
	const skewness = ss.sampleSkewness(numericData);
	const kurtosis = ss.sampleKurtosis(numericData);

	// Calculate JB statistic
	const jbStatistic =
		(n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis, 2) / 4);

	// Approximate p-value from chi-square distribution with 2 degrees of freedom
	const pValue = 1 - chiSquareCDF(jbStatistic, 2);

	// Typically, a p-value < 0.05 indicates non-normality
	const isNormal = pValue >= 0.05;

	return { statistic: jbStatistic, pValue, isNormal };
}

/**
 * 获取所有分布形态测度的统计量
 */
export function getDistributionShapeStatistics(
	data: CellValue[],
): StatisticResult[] {
	return [
		{
			name: "Fisher偏度 (Skewness)",
			value: fisherSkewness(data),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
		{
			name: "Pearson偏度 (Pearson Skewness)",
			value: pearsonSkewness(data),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
		{
			name: "四分位数偏度 (Quartile Skewness)",
			value: quartileSkewness(data),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
		{
			name: "Fisher峰度 (Excess Kurtosis)",
			value: fisherKurtosis(data),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
		{
			name: "Pearson峰度 (Raw Kurtosis)",
			value: pearsonKurtosis(data),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
		{
			name: "Jarque-Bera 正态性检验",
			value: formatJarqueBera(jarqueBera(data)),
			category: CATEGORIES.DISTRIBUTION_SHAPE,
		},
	];
}
