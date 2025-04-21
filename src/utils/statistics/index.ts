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
