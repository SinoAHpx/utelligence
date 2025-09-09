// 导出所有类型
export * from "./types";

// 导出各个模块
export * from "./central-tendency";
export * from "./dispersion";
export * from "./distribution-shape";
export * from "./basic";
export * from "./utils";
export * from "./regression";

import { getBasicStatistics } from "./basic";
// 导入各个模块的统计函数集合
import { getCentralTendencyStatistics } from "./central-tendency";
import { getDispersionStatistics } from "./dispersion";
import { getDistributionShapeStatistics } from "./distribution-shape";
import type { CellValue, StatisticResult } from "./types";

import { mean } from "./central-tendency";
import { standardDeviation as stdev } from "./dispersion";
// 为简化API导出常用函数的别名
import { fisherSkewness as skewness } from "./distribution-shape";
import { fisherKurtosis as kurtosis } from "./distribution-shape";

// 重新导出这些别名
export { skewness, kurtosis, mean, stdev };

/**
 * 计算所有描述性统计量
 * @param data 数据集
 * @returns 所有统计量的集合
 */
export function calculateDescriptiveStatistics(data: CellValue[]): StatisticResult[] {
	return [
		...getCentralTendencyStatistics(data),
		...getDispersionStatistics(data),
		...getDistributionShapeStatistics(data),
		...getBasicStatistics(data),
	];
}
