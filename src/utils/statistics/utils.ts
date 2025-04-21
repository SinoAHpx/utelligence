import { CellValue } from "./types";

/**
 * 将各种类型的数据转换为数字数组，过滤掉非数值项
 */
export function convertToNumericArray(data: CellValue[]): number[] {
	return data
		.filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
		.map((v) => (typeof v === "number" ? v : Number(v)))
		.filter((n) => !isNaN(n));
}

/**
 * 格式化Jarque-Bera测试结果
 */
export function formatJarqueBera(result: {
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

	return `统计量: ${result.statistic.toFixed(4)}, p值: ${result.pValue.toFixed(4)}, ${
		result.isNormal ? "符合正态分布" : "不符合正态分布"
	}`;
}

/**
 * 近似卡方分布的CDF，用于Jarque-Bera测试p值计算
 */
export function chiSquareCDF(x: number, df: number): number {
	if (x <= 0) return 0;

	// For df=2, the chi-square distribution is simple
	if (df === 2) {
		return 1 - Math.exp(-x / 2);
	}

	// For other df values, a more complex calculation would be needed
	// This is a simplified approximation
	return 1 - Math.exp(-x / 2) * Math.pow(x / 2, df / 2 - 1);
}
