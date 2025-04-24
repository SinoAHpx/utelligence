import { NextResponse } from "next/server";
import Papa from "papaparse";
import { mean, standardDeviation } from "@/utils/data/statistics";

// 添加用于获取异常值数据的GET端点
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const columnName = searchParams.get('columnName');
    const method = searchParams.get('method');
    const threshold = Number(searchParams.get('threshold')) || 3;

    if (!data || !columnName || !method) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        // 解析JSON数据
        const parsedData = JSON.parse(data) as Record<string, string>[];

        // 提取异常值
        const { outliers, statistics } = detectOutliers(parsedData, columnName, method, threshold);

        return NextResponse.json({
            outliers,
            statistics
        });
    } catch (error) {
        console.error("Error fetching outliers:", error);
        return NextResponse.json(
            { error: "Error processing outlier data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const columnName = formData.get("columnName") as string;
        const operation = formData.get("operation") as string;
        const method = formData.get("method") as string;
        const threshold = Number(formData.get("threshold")) || 3;

        if (!file || !columnName || !operation || !method) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Parse the file
        const text = await file.text();
        const results = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
        });

        const data = results.data as Record<string, string>[];
        const headers = results.meta.fields || [];

        if (!headers.includes(columnName)) {
            return NextResponse.json(
                { error: `Column '${columnName}' not found` },
                { status: 400 }
            );
        }

        // Extract numeric values
        const values = data
            .map(row => row[columnName])
            .filter(value => value !== undefined && value !== null && value.trim() !== "" && !isNaN(Number(value)))
            .map(value => Number(value));

        if (values.length === 0) {
            return NextResponse.json(
                { error: "No numeric values found in the selected column" },
                { status: 400 }
            );
        }

        // 使用公共函数处理异常值
        const { outlierIndices, statistics } = detectOutliers(data, columnName, method, threshold);
        const { lowerBound, upperBound } = statistics;

        // Process the data based on the operation
        let processedData = [...data];

        if (operation === "remove-outliers") {
            // Remove rows with outliers
            processedData = data.filter((_, index) => !outlierIndices.includes(index));
        }
        else if (operation === "cap-outliers") {
            // Cap outliers to boundary values
            processedData = data.map((row, index) => {
                const newRow = { ...row };
                if (outlierIndices.includes(index)) {
                    const value = Number(row[columnName]);
                    if (!isNaN(value)) {
                        if (value < lowerBound) {
                            newRow[columnName] = String(lowerBound);
                        } else if (value > upperBound) {
                            newRow[columnName] = String(upperBound);
                        }
                    }
                }
                return newRow;
            });
        }

        // Convert back to CSV
        const csv = Papa.unparse(processedData);

        // 如果指定了获取统计信息，则返回JSON响应
        const returnFormat = formData.get("returnFormat") as string;
        if (returnFormat === "json") {
            return NextResponse.json({
                statistics,
                outlierCount: outlierIndices.length,
                totalCount: data.length,
                processedCount: processedData.length
            });
        }

        // 默认返回CSV文件
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="outliers_cleaned_${file.name}"`,
            },
        });
    } catch (error) {
        console.error("Error processing outliers:", error);
        return NextResponse.json(
            { error: "Error processing outliers" },
            { status: 500 }
        );
    }
}

// 提取公共函数用于检测异常值
function detectOutliers(
    data: Record<string, string>[],
    columnName: string,
    method: string,
    threshold: number
) {
    // 提取数值
    const values = data
        .map(row => row[columnName])
        .filter(value => value !== undefined && value !== null && value.trim() !== "" && !isNaN(Number(value)))
        .map(value => Number(value));

    // 计算统计值
    const outlierIndices: number[] = [];
    let lowerBound = 0;
    let upperBound = 0;
    let methodDetails = {};

    if (method === "zscore") {
        // Z-Score方法
        const meanValue = mean(values) || 0;
        const stdDev = standardDeviation(values) || 1;

        for (let i = 0; i < data.length; i++) {
            const value = Number(data[i][columnName]);
            if (!isNaN(value)) {
                const zScore = Math.abs((value - meanValue) / stdDev);
                if (zScore > threshold) {
                    outlierIndices.push(i);
                }
            }
        }

        lowerBound = meanValue - threshold * stdDev;
        upperBound = meanValue + threshold * stdDev;
        methodDetails = { mean: meanValue, stdDev };
    }
    else if (method === "iqr") {
        // IQR方法
        const sortedValues = [...values].sort((a, b) => a - b);
        const q1Index = Math.floor(sortedValues.length * 0.25);
        const q3Index = Math.floor(sortedValues.length * 0.75);

        const q1 = sortedValues[q1Index];
        const q3 = sortedValues[q3Index];
        const iqr = q3 - q1;

        lowerBound = q1 - threshold * iqr;
        upperBound = q3 + threshold * iqr;
        methodDetails = { q1, q3, iqr };

        for (let i = 0; i < data.length; i++) {
            const value = Number(data[i][columnName]);
            if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
                outlierIndices.push(i);
            }
        }
    }
    else if (method === "percentile") {
        // 百分位方法
        const sortedValues = [...values].sort((a, b) => a - b);
        const lowerPercentile = threshold;
        const upperPercentile = 100 - threshold;

        const lowerIndex = Math.max(0, Math.floor(sortedValues.length * (lowerPercentile / 100)));
        const upperIndex = Math.min(sortedValues.length - 1, Math.floor(sortedValues.length * (upperPercentile / 100)));

        lowerBound = sortedValues[lowerIndex];
        upperBound = sortedValues[upperIndex];
        methodDetails = { lowerPercentile, upperPercentile };

        for (let i = 0; i < data.length; i++) {
            const value = Number(data[i][columnName]);
            if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
                outlierIndices.push(i);
            }
        }
    }

    // 提取异常值数据
    const outliers = outlierIndices.map(index => ({
        ...data[index],
        _index: index
    }));

    return {
        outlierIndices,
        outliers,
        statistics: {
            method,
            threshold,
            lowerBound,
            upperBound,
            outlierCount: outlierIndices.length,
            totalCount: data.length,
            methodDetails
        }
    };
} 