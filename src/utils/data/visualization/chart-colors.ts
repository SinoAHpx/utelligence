// 美观的配色方案
export const CHART_COLORS = [
	"#8884d8", // 紫色
	"#82ca9d", // 绿色
	"#ffc658", // 黄色
	"#ff8042", // 橙色
	"#0088FE", // 蓝色
	"#00C49F", // 青色
	"#FFBB28", // 金色
	"#FF8042", // 橙红色
	"#a4de6c", // 浅绿
	"#d0ed57", // 黄绿
	"#83a6ed", // 天蓝
	"#8dd1e1", // 浅蓝
	"#a4add3", // 淡紫
	"#d85896", // 粉红
	"#ffc0cb", // 粉色
	"#e8c3b9", // 棕色
];

// 获取颜色的辅助函数
export const getChartColor = (index: number) =>
	CHART_COLORS[index % CHART_COLORS.length];
