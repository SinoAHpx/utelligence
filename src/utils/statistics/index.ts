// 导出所有类型
export * from "./types";

// 导出各个模块
export * from "./central-tendency";
export * from "./dispersion";
export * from "./distribution-shape";
export * from "./basic";
export * from "./utils";

// 导入各个模块的统计函数集合
import { getCentralTendencyStatistics } from "./central-tendency";
import { getDispersionStatistics } from "./dispersion";
import { getDistributionShapeStatistics } from "./distribution-shape";
import { getBasicStatistics } from "./basic";
import { CellValue, StatisticResult } from "./types";

// 为简化API导出常用函数的别名
import { fisherSkewness as skewness } from "./distribution-shape";
import { fisherKurtosis as kurtosis } from "./distribution-shape";

// 重新导出这些别名
export { skewness, kurtosis };

/**
 * 计算所有描述性统计量
 * @param data 数据集
 * @returns 所有统计量的集合
 */
export function calculateDescriptiveStatistics(
	data: CellValue[],
): StatisticResult[] {
	return [
		...getCentralTendencyStatistics(data),
		...getDispersionStatistics(data),
		...getDistributionShapeStatistics(data),
		...getBasicStatistics(data),
	];
}
