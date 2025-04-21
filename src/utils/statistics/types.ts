export type CellValue = string | number | null | undefined;

export interface StatisticResult {
	name: string;
	value: number | string | null | (string | number)[];
	category: string;
}

// 公共的类别常量
export const CATEGORIES = {
	CENTRAL_TENDENCY: "集中趋势测度",
	DISPERSION: "离散程度测度",
	DISTRIBUTION_SHAPE: "分布形态测度",
	BASIC: "基本统计量",
	INFERENTIAL: "推断性统计",
};
