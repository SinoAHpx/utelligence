import { useOutliersStore } from "@/store/outliersStore";

/**
 * 使用Z-Score方法检测异常值
 * Z-Score: (x - μ) / σ，其中 μ 是平均值，σ 是标准差
 * 如果值的 Z-Score 超过阈值，则视为异常值
 */
function detectZScoreOutliers(
    data: any[],
    columnName: string,
    threshold: number = 3
) {
    // 提取数值
    const values = data
        .map((item) => parseFloat(item[columnName]))
        .filter((val) => !isNaN(val));

    if (values.length === 0) {
        return {
            lowerBound: 0,
            upperBound: 0,
            outlierIndices: [],
            methodDetails: {},
        };
    }

    // 计算平均值和标准差
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    // 计算标准差
    const squareDiffs = values.map((val) => Math.pow(val - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // 使用 Z-Score 确定界限
    const lowerBound = mean - threshold * stdDev;
    const upperBound = mean + threshold * stdDev;

    // 找出异常值
    const outlierIndices = data
        .map((item, index) => {
            const value = parseFloat(item[columnName]);
            if (isNaN(value)) return -1;
            return value < lowerBound || value > upperBound ? index : -1;
        })
        .filter((index) => index !== -1);

    return {
        lowerBound,
        upperBound,
        outlierIndices,
        methodDetails: { mean, stdDev },
    };
}

/**
 * 使用IQR方法检测异常值
 * IQR: Q3 - Q1，其中 Q1 是第一四分位数，Q3 是第三四分位数
 * 如果值小于 Q1 - threshold*IQR 或大于 Q3 + threshold*IQR，则视为异常值
 */
function detectIQROutliers(
    data: any[],
    columnName: string,
    threshold: number = 1.5
) {
    // 提取数值并排序
    const values = data
        .map((item) => parseFloat(item[columnName]))
        .filter((val) => !isNaN(val))
        .sort((a, b) => a - b);

    if (values.length === 0) {
        return {
            lowerBound: 0,
            upperBound: 0,
            outlierIndices: [],
            methodDetails: {},
        };
    }

    // 计算四分位数
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;

    // 确定边界
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;

    // 找出异常值
    const outlierIndices = data
        .map((item, index) => {
            const value = parseFloat(item[columnName]);
            if (isNaN(value)) return -1;
            return value < lowerBound || value > upperBound ? index : -1;
        })
        .filter((index) => index !== -1);

    return {
        lowerBound,
        upperBound,
        outlierIndices,
        methodDetails: { q1, q3, iqr },
    };
}

/**
 * 使用百分位数方法检测异常值
 * 如果值小于第 threshold 百分位或大于第 (100-threshold) 百分位，则视为异常值
 */
function detectPercentileOutliers(
    data: any[],
    columnName: string,
    threshold: number = 5 // 默认使用 5% 和 95% 百分位
) {
    // 提取数值并排序
    const values = data
        .map((item) => parseFloat(item[columnName]))
        .filter((val) => !isNaN(val))
        .sort((a, b) => a - b);

    if (values.length === 0) {
        return {
            lowerBound: 0,
            upperBound: 0,
            outlierIndices: [],
            methodDetails: {},
        };
    }

    // 计算百分位
    const lowerIndex = Math.floor((values.length * threshold) / 100);
    const upperIndex = Math.floor((values.length * (100 - threshold)) / 100);
    const lowerBound = values[lowerIndex];
    const upperBound = values[upperIndex];

    // 找出异常值
    const outlierIndices = data
        .map((item, index) => {
            const value = parseFloat(item[columnName]);
            if (isNaN(value)) return -1;
            return value < lowerBound || value > upperBound ? index : -1;
        })
        .filter((index) => index !== -1);

    return {
        lowerBound,
        upperBound,
        outlierIndices,
        methodDetails: {
            lowerPercentile: threshold,
            upperPercentile: 100 - threshold
        },
    };
}

/**
 * 检测异常值并返回结果
 * @param data 要分析的数据
 * @param columnName 要分析的列名
 * @param method 检测方法：'zscore', 'iqr', 或 'percentile'
 * @param threshold 阈值
 */
export function detectOutliers(
    data: any[],
    columnName: string,
    method: string = "zscore",
    threshold: number = 3
) {
    if (!data || !data.length || !columnName) {
        return {
            lowerBound: 0,
            upperBound: 0,
            method: "",
            threshold: 0,
            outlierCount: 0,
            totalCount: 0,
            methodDetails: {},
        };
    }

    let result;

    // 根据方法选择检测函数
    switch (method) {
        case "iqr":
            result = detectIQROutliers(data, columnName, threshold);
            break;
        case "percentile":
            result = detectPercentileOutliers(data, columnName, threshold);
            break;
        case "zscore":
        default:
            result = detectZScoreOutliers(data, columnName, threshold);
            break;
    }

    // 计算统计信息
    const validCount = data
        .map((item) => parseFloat(item[columnName]))
        .filter((val) => !isNaN(val)).length;

    return {
        ...result,
        method,
        threshold,
        outlierCount: result.outlierIndices.length,
        totalCount: validCount,
    };
}

/**
 * 使用 Zustand store 执行异常值检测
 */
export function detectOutliersWithStore(
    data: any[],
    columnName: string,
    method: string = "zscore",
    threshold: number = 3
) {
    const store = useOutliersStore.getState();

    const statistics = detectOutliers(data, columnName, method, threshold);

    // 更新 store
    store.setData(data);
    store.setColumnName(columnName);
    store.setMethod(method);
    store.setThreshold(threshold);
    store.setStatistics(statistics);
    store.updateChartData();

    return statistics;
} 