import * as ss from "simple-statistics";

export type CellValue = string | number | null | undefined;

/**
 * Measures of Central Tendency
 */

// 算术平均数 (Arithmetic Mean)
export function mean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return ss.mean(numericData);
}

// 几何平均数 (Geometric Mean)
export function geometricMean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;

	// Geometric mean only works with positive numbers
	const positiveData = numericData.filter((num) => num > 0);
	if (positiveData.length === 0) return null;

	return ss.geometricMean(positiveData);
}

// 调和平均数 (Harmonic Mean)
export function harmonicMean(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;

	// Harmonic mean only works with non-zero numbers
	const nonZeroData = numericData.filter((num) => num !== 0);
	if (nonZeroData.length === 0) return null;

	return ss.harmonicMean(nonZeroData);
}

// 中位数 (Median)
export function median(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return ss.median(numericData);
}

// 众数 (Mode) - can return multiple values
export function mode(data: CellValue[]): (string | number)[] {
	const cleanedData = data.filter(
		(v) => v !== null && v !== undefined && String(v).trim() !== "",
	);
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
 * Measures of Dispersion
 */

// 方差 (Variance)
export function variance(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null; // Need at least 2 values for variance
	return ss.variance(numericData);
}

// 标准差 (Standard Deviation)
export function standardDeviation(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null; // Need at least 2 values for std dev
	return ss.standardDeviation(numericData);
}

// 极差 (Range)
export function range(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.max(...numericData) - Math.min(...numericData);
}

// 四分位距 (Interquartile Range, IQR)
export function interquartileRange(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null; // Need a reasonable number of values for IQR

	const q1 = ss.quantile(numericData, 0.25);
	const q3 = ss.quantile(numericData, 0.75);
	return q3 - q1;
}

// 平均绝对离差 (Mean Absolute Deviation, MAD)
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

// 变异系数 (Coefficient of Variation, CV)
export function coefficientOfVariation(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null;

	const mean = ss.mean(numericData);
	if (mean === 0) return null; // Avoid division by zero

	const stdDev = ss.standardDeviation(numericData);
	return stdDev / mean;
}

// 方差系数 (Coefficient of Dispersion)
export function coefficientOfDispersion(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length <= 1) return null;

	const variance = ss.variance(numericData);
	const mean = ss.mean(numericData);

	if (mean === 0) return null; // Avoid division by zero
	return variance / mean;
}

// 基尼系数 (Gini Coefficient)
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
 * Measures of Distribution Shape
 */

// Fisher 偏度 (Fisher Skewness)
export function fisherSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 3) return null; // Need at least 3 values for skewness
	return ss.sampleSkewness(numericData);
}

// Pearson 偏度 (Pearson Skewness)
export function pearsonSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 3) return null;

	const mean = ss.mean(numericData);
	const median = ss.median(numericData);
	const stdDev = ss.standardDeviation(numericData);

	if (stdDev === 0) return null; // Avoid division by zero
	return (3 * (mean - median)) / stdDev;
}

// 四分位数偏度 (Quartile Skewness)
export function quartileSkewness(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null;

	const q1 = ss.quantile(numericData, 0.25);
	const q2 = ss.quantile(numericData, 0.5); // median
	const q3 = ss.quantile(numericData, 0.75);

	if (q3 - q1 === 0) return null; // Avoid division by zero
	return (q3 - q2 - (q2 - q1)) / (q3 - q1);
}

// Fisher 峰度 / 超额峰度 (Fisher Kurtosis / Excess Kurtosis)
export function fisherKurtosis(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null; // Need at least 4 values for kurtosis
	return ss.sampleKurtosis(numericData);
}

// Pearson 峰度 / 原始峰度 (Pearson Kurtosis / Raw Kurtosis)
export function pearsonKurtosis(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length < 4) return null;

	// Pearson Kurtosis = Fisher Kurtosis + 3
	const fisherKurt = ss.sampleKurtosis(numericData);
	return fisherKurt + 3;
}

// Jarque-Bera 检验 (用于评估正态性)
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
	// This is an approximation; for exact p-values, a proper chi-square table would be needed
	const pValue = 1 - chiSquareCDF(jbStatistic, 2);

	// Typically, a p-value < 0.05 indicates non-normality
	const isNormal = pValue >= 0.05;

	return { statistic: jbStatistic, pValue, isNormal };
}

// Helper for Jarque-Bera p-value calculation
// Approximate chi-square CDF with 2 degrees of freedom
function chiSquareCDF(x: number, df: number): number {
	if (x <= 0) return 0;

	// For df=2, the chi-square distribution is simple
	if (df === 2) {
		return 1 - Math.exp(-x / 2);
	}

	// For other df values, a more complex calculation would be needed
	// This is a simplified approximation
	return 1 - Math.exp(-x / 2) * Math.pow(x / 2, df / 2 - 1);
}

/**
 * Calculate all descriptive statistics at once
 */
export function calculateDescriptiveStatistics(data: CellValue[]): {
	name: string;
	value: number | string | null | (string | number)[];
	category: string;
}[] {
	return [
		// Measures of Central Tendency
		{ name: "平均值 (Mean)", value: mean(data), category: "集中趋势测度" },
		{
			name: "几何平均数 (Geometric Mean)",
			value: geometricMean(data),
			category: "集中趋势测度",
		},
		{
			name: "调和平均数 (Harmonic Mean)",
			value: harmonicMean(data),
			category: "集中趋势测度",
		},
		{ name: "中位数 (Median)", value: median(data), category: "集中趋势测度" },
		{ name: "众数 (Mode)", value: mode(data), category: "集中趋势测度" },

		// Measures of Dispersion
		{
			name: "方差 (Variance)",
			value: variance(data),
			category: "离散程度测度",
		},
		{
			name: "标准差 (Standard Deviation)",
			value: standardDeviation(data),
			category: "离散程度测度",
		},
		{ name: "极差 (Range)", value: range(data), category: "离散程度测度" },
		{
			name: "四分位距 (IQR)",
			value: interquartileRange(data),
			category: "离散程度测度",
		},
		{
			name: "平均绝对离差 (MAD)",
			value: meanAbsoluteDeviation(data),
			category: "离散程度测度",
		},
		{
			name: "变异系数 (CV)",
			value: coefficientOfVariation(data),
			category: "离散程度测度",
		},
		{
			name: "方差系数 (Coefficient of Dispersion)",
			value: coefficientOfDispersion(data),
			category: "离散程度测度",
		},
		{
			name: "基尼系数 (Gini Coefficient)",
			value: giniCoefficient(data),
			category: "离散程度测度",
		},

		// Measures of Distribution Shape
		{
			name: "Fisher偏度 (Skewness)",
			value: fisherSkewness(data),
			category: "分布形态测度",
		},
		{
			name: "Pearson偏度 (Pearson Skewness)",
			value: pearsonSkewness(data),
			category: "分布形态测度",
		},
		{
			name: "四分位数偏度 (Quartile Skewness)",
			value: quartileSkewness(data),
			category: "分布形态测度",
		},
		{
			name: "Fisher峰度 (Excess Kurtosis)",
			value: fisherKurtosis(data),
			category: "分布形态测度",
		},
		{
			name: "Pearson峰度 (Raw Kurtosis)",
			value: pearsonKurtosis(data),
			category: "分布形态测度",
		},

		// Normality Test
		{
			name: "Jarque-Bera 正态性检验",
			value: formatJarqueBera(jarqueBera(data)),
			category: "分布形态测度",
		},

		// Additional basic stats
		{ name: "最小值 (Minimum)", value: min(data), category: "基本统计量" },
		{ name: "最大值 (Maximum)", value: max(data), category: "基本统计量" },
		{ name: "样本数量 (Count)", value: count(data), category: "基本统计量" },
	];
}

/**
 * Helper functions
 */

// Convert to array of numbers, filtering out non-numeric values
function convertToNumericArray(data: CellValue[]): number[] {
	return data
		.filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
		.map((v) => (typeof v === "number" ? v : Number(v)))
		.filter((n) => !isNaN(n));
}

// Format Jarque-Bera test results
function formatJarqueBera(result: {
	statistic: number | null;
	pValue: number | null;
	isNormal: boolean | null;
}): string {
	if (
		result.statistic === null ||
		result.pValue === null ||
		result.isNormal === null
	) {
		return "样本量不足";
	}

	return `统计量: ${result.statistic.toFixed(4)}, p值: ${result.pValue.toFixed(4)}, ${result.isNormal ? "符合正态分布" : "不符合正态分布"}`;
}

// Minimum value
function min(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.min(...numericData);
}

// Maximum value
function max(data: CellValue[]): number | null {
	const numericData = convertToNumericArray(data);
	if (numericData.length === 0) return null;
	return Math.max(...numericData);
}

// Count of valid values
function count(data: CellValue[]): number {
	return convertToNumericArray(data).length;
}
