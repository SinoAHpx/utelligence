import type { ChartConfig, ChartDataItem } from "@/types/chart-types";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Define a constant for max data points
const MAX_DATA_POINTS = 500; // Adjust as needed

/**
 * Type definitions for file data
 */
// export type CellValue = string | number; // Defined below now to avoid circular dep issue if separated
// export type FileRow = CellValue[];
// export type FileData = FileRow[];

/**
 * Type definitions needed within this file
 */
export type CellValue = string | number | null | undefined;
export type FileRow = CellValue[];
export type FileData = FileRow[];

/**
 * Analyze column data to determine its characteristics
 * @param columnData Data for a single column
 * @param columnName The name of the column
 * @returns Analysis results including type, uniqueness, and visualization suitability
 */
export const analyzeColumnData = (columnData: CellValue[], columnName: string) => {
	const cleanedData = columnData.filter(
		(v) => v !== undefined && v !== null && String(v).trim() !== ""
	);
	if (cleanedData.length === 0) {
		return {
			column: columnName,
			isEmpty: true,
			uniqueValues: 0,
			isNumeric: false,
			isCategorical: false,
			isValidForVisualization: false,
			frequencies: {},
			uniqueValueList: [],
			totalValues: 0,
		};
	}

	const freqMap: { [key: string]: number } = {};
	let allNumeric = true;
	const uniqueSet = new Set<string>();

	for (const value of cleanedData) {
		const stringValue = String(value).trim();
		freqMap[stringValue] = (freqMap[stringValue] || 0) + 1;
		uniqueSet.add(stringValue);

		if (allNumeric && isNaN(Number(stringValue))) {
			allNumeric = false;
		}
	}

	const uniqueCount = uniqueSet.size;
	const totalValues = cleanedData.length;

	// Heuristics for determining categorical vs. continuous/high-cardinality
	// Consider a column categorical if it's not all numeric OR if it is numeric but has relatively few unique values.
	const isCategorical =
		!allNumeric || (allNumeric && uniqueCount <= Math.max(15, totalValues * 0.1)); // Adjust threshold as needed
	const isValidForVisualization = uniqueCount > 1 && uniqueCount < totalValues * 0.9; // Generally, avoid constant or unique-per-row columns

	return {
		column: columnName,
		isEmpty: false,
		uniqueValues: uniqueCount,
		isNumeric: allNumeric,
		isCategorical,
		isValidForVisualization,
		frequencies: freqMap,
		uniqueValueList: Array.from(uniqueSet),
		totalValues,
	};
};

/**
 * Helper function to validate axis selections and extract necessary info.
 * @param headers Array of column headers.
 * @param rows The file data rows.
 * @param xAxisColumn Selected X-axis column name.
 * @param yAxisColumn Selected Y-axis column name.
 * @param chartTypeName Name of the chart type for error messages.
 * @returns Object with success status, indices, Y-axis analysis, or an error message.
 */
const validateAndExtractAxisInfo = (
	headers: string[],
	rows: FileData,
	xAxisColumn: string | undefined,
	yAxisColumn: string | undefined,
	chartTypeName: string
):
	| {
			success: true;
			xAxisIndex: number;
			yAxisIndex: number;
			yAxisAnalysis: ReturnType<typeof analyzeColumnData>;
	  }
	| { success: false; error: string } => {
	if (!xAxisColumn || !yAxisColumn) {
		return {
			success: false,
			error: `X and Y axes must be selected for ${chartTypeName}.`,
		};
	}

	const xAxisIndex = headers.indexOf(xAxisColumn);
	const yAxisIndex = headers.indexOf(yAxisColumn);

	if (xAxisIndex === -1) {
		return {
			success: false,
			error: `X-axis column '${xAxisColumn}' not found.`,
		};
	}
	if (yAxisIndex === -1) {
		return {
			success: false,
			error: `Y-axis column '${yAxisColumn}' not found.`,
		};
	}

	const yColumnData = rows.map((row) => row[yAxisIndex]);
	const yAxisAnalysis = analyzeColumnData(yColumnData, yAxisColumn);

	if (yAxisAnalysis.isEmpty) {
		return {
			success: false,
			error: `Y-axis column '${yAxisColumn}' contains no valid data.`,
		};
	}

	return { success: true, xAxisIndex, yAxisIndex, yAxisAnalysis };
};

/**
 * Groups data rows based on the value in the X-axis column.
 * Also determines if X-axis values are numeric and returns sorted unique X values.
 * @param rows The file data rows.
 * @param xAxisIndex The index of the X-axis column.
 * @param headers Array of column headers.
 * @returns Object containing grouped data, sorted X values, and numeric flag.
 */
const groupDataByXAxis = (
	rows: FileData,
	xAxisIndex: number,
	headers: string[]
): {
	groupedData: { [key: string]: FileData };
	sortedXValues: (string | number)[];
	allXAreNumeric: boolean;
} => {
	const groupedData: { [key: string]: FileData } = {};
	let allXAreNumeric = true;
	const xValuesSet = new Set<string | number>();

	for (const row of rows) {
		let xValue: string | number | null | undefined = row[xAxisIndex];
		const numXValue = Number(xValue);

		// Try converting to number if possible, otherwise treat as string
		if (
			xValue !== null &&
			xValue !== undefined &&
			String(xValue).trim() !== "" &&
			!isNaN(numXValue)
		) {
			xValue = numXValue; // Keep as number if numeric
		} else {
			allXAreNumeric = false; // Mark as non-numeric if conversion fails or non-numeric chars found
			xValue = String(xValue ?? "").trim(); // Treat as string
		}

		// Skip empty values or values that are actual headers
		if (xValue === "" || xValue === null || xValue === undefined) continue;
		if (typeof xValue === "string" && headers.indexOf(xValue) !== -1) continue;

		xValuesSet.add(xValue);
		const xValueKey = String(xValue); // Use string key for the object
		if (!groupedData[xValueKey]) {
			groupedData[xValueKey] = [];
		}
		groupedData[xValueKey].push(row);
	}

	// Sort X values (numerically if possible, otherwise string locale compare)
	const sortedXValues = Array.from(xValuesSet).sort((a, b) => {
		if (allXAreNumeric) {
			return (a as number) - (b as number);
		}
		return String(a).localeCompare(String(b));
	});

	return { groupedData, sortedXValues, allXAreNumeric };
};

/**
 * Process file data from a CSV or Excel file and store raw data
 * @param file File to process
 * @param onSuccess Callback with raw headers and rows
 * @param onError Callback for processing errors
 */
export const processFileData = async (
	file: File,
	onSuccess: (data: { headers: string[]; rows: FileData }) => void,
	onError: (error: string) => void
) => {
	if (!file) {
		onError("No file selected");
		return;
	}

	try {
		const fileExtension = file.name.split(".").pop()?.toLowerCase();
		let headers: string[] = [];
		let rows: FileData = [];

		if (fileExtension === "csv") {
			const text = await file.text();
			const results = Papa.parse<string[]>(text, {
				skipEmptyLines: true,
			});
			if (results.errors.length > 0) {
				throw new Error(
					`CSV Parsing Error: ${results.errors[0].message} on row ${results.errors[0].row}`
				);
			}
			if (results.data.length > 0) {
				headers = results.data[0];
				rows = results.data.slice(1);
			} else {
				throw new Error("CSV file is empty or invalid");
			}
		} else if (fileExtension === "xlsx" || fileExtension === "xls") {
			const arrayBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer);
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

			if (jsonData.length > 0) {
				headers = (jsonData[0] as any[]).map(String); // Ensure headers are strings
				rows = jsonData.slice(1) as FileData;
			} else {
				throw new Error("Excel file is empty or invalid");
			}
		} else {
			onError("Unsupported file type. Please upload a CSV or Excel file.");
			return;
		}

		// Clean data: trim strings, handle potential nulls/undefined explicitly
		const cleanedRows = rows.map((row) =>
			row.map((cell) =>
				typeof cell === "string" ? cell.trim() : cell !== null && cell !== undefined ? cell : null
			)
		);

		onSuccess({ headers, rows: cleanedRows });
	} catch (err: any) {
		console.error("File parsing error:", err);
		onError(`Error processing file: ${err.message || err}`);
	}
};

/**
 * Process raw data specifically for generating bar charts (stacked or simple/grouped)
 * @param rawData The raw headers and rows from the file
 * @param config Basic chart config with xAxisColumn and yAxisColumn selected
 * @returns An object containing processed data, layout type, and relevant keys for Recharts
 */
const MAX_Y_CATEGORIES_FOR_BAR_CHART = 10; // Define a threshold

export const processBarChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: Pick<ChartConfig, "xAxisColumn" | "yAxisColumn">
): Pick<ChartConfig, "processedData" | "layout" | "yCategories" | "yKey" | "isTruncated"> & {
	error?: string;
} => {
	const { headers, rows } = rawData;
	const { xAxisColumn, yAxisColumn } = config;

	const axisInfo = validateAndExtractAxisInfo(
		headers,
		rows,
		xAxisColumn,
		yAxisColumn,
		"bar charts"
	);

	if (!axisInfo.success) {
		return {
			error: axisInfo.error,
			isTruncated: false,
		};
	}

	const { xAxisIndex, yAxisIndex, yAxisAnalysis } = axisInfo;

	if (yAxisAnalysis.uniqueValues > MAX_Y_CATEGORIES_FOR_BAR_CHART) {
		return {
			isTruncated: false,
			error:
				`Y-axis column '${yAxisColumn}' has too many unique values (${yAxisAnalysis.uniqueValues}) ` +
				`for a bar chart. Maximum allowed is ${MAX_Y_CATEGORIES_FOR_BAR_CHART}.`,
		};
	}

	// Use the new helper for grouping and sorting
	const { groupedData, sortedXValues } = groupDataByXAxis(rows, xAxisIndex, headers);

	let processedData: ChartDataItem[] = [];
	let layout: "stacked" | "simple" = "simple";
	let yCategories: string[] = [];
	const yKey = "count";

	if (yAxisAnalysis.isCategorical && yAxisAnalysis.uniqueValues > 1) {
		layout = "stacked";
		yCategories = yAxisAnalysis.uniqueValueList.sort();

		for (const xValue of sortedXValues) {
			const groupRows = groupedData[xValue];
			const counts: { [yCategory: string]: number } = {};
			yCategories.forEach((cat) => (counts[cat] = 0));
			for (const row of groupRows) {
				const yValue = String(row[yAxisIndex] ?? "").trim();
				if (yValue !== "" && counts.hasOwnProperty(yValue)) {
					counts[yValue]++;
				}
			}
			processedData.push({ name: xValue, ...counts });
		}
	} else {
		layout = "simple";
		for (const xValue of sortedXValues) {
			const count = groupedData[xValue].filter(
				(row) =>
					row[yAxisIndex] !== null &&
					row[yAxisIndex] !== undefined &&
					String(row[yAxisIndex]).trim() !== ""
			).length;
			processedData.push({ name: xValue, [yKey]: count });
		}
	}

	let isTruncated = false;
	if (processedData.length > MAX_DATA_POINTS) {
		console.warn(
			`Bar chart data truncated from ${processedData.length} to ${MAX_DATA_POINTS} points.`
		);
		processedData = processedData.slice(0, MAX_DATA_POINTS);
		isTruncated = true;
	}

	return {
		processedData,
		layout,
		...(layout === "stacked" ? { yCategories } : { yKey }),
		isTruncated,
	};
};

/**
 * Process raw data specifically for generating line charts
 * Handles both single numeric lines and multi-line trends based on a categorical Y-axis.
 * @param rawData The raw headers and rows from the file
 * @param config Basic chart config with xAxisColumn and yAxisColumns selected
 * @returns An object containing processed data, categories (for multi-line), and relevant keys for Recharts
 */
export const processLineChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: Pick<ChartConfig, "xAxisColumn" | "yAxisColumn">
): Pick<ChartConfig, "processedData" | "yCategories" | "numericYKey" | "isTruncated"> & {
	error?: string;
} => {
	const { headers, rows } = rawData;
	const { xAxisColumn, yAxisColumn } = config;

	const axisInfo = validateAndExtractAxisInfo(
		headers,
		rows,
		xAxisColumn,
		yAxisColumn,
		"line charts"
	);

	if (!axisInfo.success) {
		return {
			processedData: [],
			yCategories: [],
			numericYKey: undefined,
			error: axisInfo.error,
			isTruncated: false,
		};
	}

	const { xAxisIndex, yAxisIndex: primaryYAxisIndex, yAxisAnalysis } = axisInfo;

	// Use the new helper for grouping and sorting
	const { groupedData, sortedXValues, allXAreNumeric } = groupDataByXAxis(
		rows,
		xAxisIndex,
		headers
	);

	let processedData: ChartDataItem[] = [];
	let yCategoriesResult: string[] = [];
	let numericYKey: string | undefined = undefined;

	if (yAxisAnalysis.isCategorical && yAxisAnalysis.uniqueValues > 1) {
		yCategoriesResult = yAxisAnalysis.uniqueValueList.sort();

		const MAX_TREND_CATEGORIES = 10;
		if (yCategoriesResult.length > MAX_TREND_CATEGORIES) {
			return {
				processedData: [],
				yCategories: [],
				numericYKey: undefined,
				error: `类别 (${yCategoriesResult.length}) 过多，位于 '${yAxisColumn}' 中，无法生成趋势线图。最大允许值为 ${MAX_TREND_CATEGORIES}。`,
				isTruncated: false,
			};
		}

		for (const xValue of sortedXValues) {
			const xValueKey = String(xValue);
			const groupRows = groupedData[xValueKey] || [];
			const counts: { [yCategory: string]: number } = {};
			yCategoriesResult.forEach((cat) => (counts[cat] = 0));
			for (const row of groupRows) {
				const yValue = String(row[primaryYAxisIndex] ?? "").trim();
				if (yValue !== "" && counts.hasOwnProperty(yValue)) {
					counts[yValue]++;
				}
			}
			processedData.push({ [String(xAxisColumn)]: xValue, ...counts });
		}
	} else if (yAxisAnalysis.isNumeric) {
		numericYKey = yAxisColumn;

		for (const xValue of sortedXValues) {
			const xValueKey = String(xValue);
			const groupRows = groupedData[xValueKey] || [];
			let sum = 0;
			let count = 0;
			for (const row of groupRows) {
				const yValue = row[primaryYAxisIndex];
				const numYValue = Number(yValue);
				if (yValue !== null && yValue !== undefined && !isNaN(numYValue)) {
					sum += numYValue;
					count++;
				}
			}
			const averageY = count > 0 ? sum / count : 0;
			if (numericYKey) {
				processedData.push({
					[String(xAxisColumn)]: xValue,
					[String(numericYKey)]: averageY,
				});
			} else {
				console.error("Numeric Y key is undefined despite numeric analysis");
			}
		}
	} else {
		return {
			processedData: [],
			yCategories: [],
			numericYKey: undefined,
			error: `Y 轴列 '${yAxisColumn}' 不适合线形图（既不是数字也不是充分分类）。`,
			isTruncated: false,
		};
	}

	let isTruncated = false;
	if (processedData.length > MAX_DATA_POINTS) {
		console.warn(
			`Line chart data truncated from ${processedData.length} to ${MAX_DATA_POINTS} points.`
		);
		processedData = processedData.slice(0, MAX_DATA_POINTS);
		isTruncated = true;
	}

	return {
		processedData,
		yCategories: yCategoriesResult,
		numericYKey,
		isTruncated,
	};
};

/**
 * Process raw data specifically for generating area charts.
 * Handles both single numeric areas (summed) and multi-area trends based on a categorical Y-axis (stacked counts).
 * @param rawData The raw headers and rows from the file
 * @param config Basic chart config with xAxisColumn and yAxisColumns selected
 * @returns An object containing processed data, categories (for stacked), and numericYKey (for single) for Recharts
 */
export const processAreaChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: Pick<ChartConfig, "xAxisColumn" | "yAxisColumn">
): Pick<ChartConfig, "processedData" | "yCategories" | "numericYKey" | "isTruncated"> & {
	error?: string;
} => {
	const { headers, rows } = rawData;
	const { xAxisColumn, yAxisColumn } = config;

	const axisInfo = validateAndExtractAxisInfo(
		headers,
		rows,
		xAxisColumn,
		yAxisColumn,
		"area charts"
	);

	if (!axisInfo.success) {
		return {
			processedData: [],
			yCategories: [],
			numericYKey: undefined,
			error: axisInfo.error,
			isTruncated: false,
		};
	}

	const { xAxisIndex, yAxisIndex, yAxisAnalysis } = axisInfo;

	// Use the new helper for grouping and sorting
	const { groupedData, sortedXValues, allXAreNumeric } = groupDataByXAxis(
		rows,
		xAxisIndex,
		headers
	);

	let processedData: ChartDataItem[] = [];
	let yCategoriesResult: string[] = [];
	let numericYKey: string | undefined = undefined;

	if (yAxisAnalysis.isCategorical && yAxisAnalysis.uniqueValues > 1) {
		yCategoriesResult = yAxisAnalysis.uniqueValueList.sort();

		const MAX_STACK_CATEGORIES = 10;
		if (yCategoriesResult.length > MAX_STACK_CATEGORIES) {
			return {
				processedData: [],
				yCategories: [],
				numericYKey: undefined,
				error: `类别 (${yCategoriesResult.length}) 过多，位于 '${yAxisColumn}' 中，无法生成堆叠面积图。最大允许值为 ${MAX_STACK_CATEGORIES}。`,
				isTruncated: false,
			};
		}

		for (const xValue of sortedXValues) {
			const xValueKey = String(xValue);
			const groupRows = groupedData[xValueKey] || [];
			const counts: { [yCategory: string]: number } = {};
			yCategoriesResult.forEach((cat) => (counts[cat] = 0));
			for (const row of groupRows) {
				const yValue = String(row[yAxisIndex] ?? "").trim();
				if (yValue !== "" && counts.hasOwnProperty(yValue)) {
					counts[yValue]++;
				}
			}
			processedData.push({ [String(xAxisColumn)]: xValue, ...counts });
		}
	} else if (yAxisAnalysis.isNumeric) {
		numericYKey = yAxisColumn;

		for (const xValue of sortedXValues) {
			const xValueKey = String(xValue);
			const groupRows = groupedData[xValueKey] || [];
			let sum = 0;
			for (const row of groupRows) {
				const yValue = row[yAxisIndex];
				const numYValue = Number(yValue);
				if (yValue !== null && yValue !== undefined && !isNaN(numYValue)) {
					sum += numYValue;
				}
			}
			if (numericYKey) {
				processedData.push({
					[String(xAxisColumn)]: xValue,
					[String(numericYKey)]: sum,
				});
			} else {
				console.error("Numeric Y key is undefined despite numeric analysis");
			}
		}
	} else {
		return {
			processedData: [],
			yCategories: [],
			numericYKey: undefined,
			error: `Y 轴列 '${yAxisColumn}' 不适合面积图（既不是数字也不是充分分类）。`,
			isTruncated: false,
		};
	}

	let isTruncated = false;
	if (processedData.length > MAX_DATA_POINTS) {
		console.warn(
			`Area chart data truncated from ${processedData.length} to ${MAX_DATA_POINTS} points.`
		);
		processedData = processedData.slice(0, MAX_DATA_POINTS);
		isTruncated = true;
	}

	return {
		processedData,
		yCategories: yCategoriesResult,
		numericYKey,
		isTruncated,
	};
};

/**
 * Process raw data specifically for generating pie charts.
 * Calculates the frequency of unique values in a single selected column.
 * @param rawData The raw headers and rows from the file
 * @param config Basic chart config containing the valueColumn to analyze
 * @returns An object containing processed data [{ name: category, value: count }, ...] for Recharts
 */
export const processPieChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: { valueColumn: string }
): Pick<ChartConfig, "processedData" | "isTruncated"> & { error?: string } => {
	const { headers, rows } = rawData;
	const { valueColumn } = config;

	if (!valueColumn) {
		return {
			processedData: [],
			error: "必须为饼图选择一列。",
			isTruncated: false,
		};
	}

	const valueColumnIndex = headers.indexOf(valueColumn);
	if (valueColumnIndex === -1) {
		return {
			processedData: [],
			error: `选定列 '${valueColumn}' 未找到。`,
			isTruncated: false,
		};
	}

	const columnData = rows
		.map((row) => row[valueColumnIndex])
		.filter((row) => headers.indexOf(row?.toString()!) === -1);
	const analysis = analyzeColumnData(columnData, valueColumn);

	if (analysis.isEmpty) {
		return {
			processedData: [],
			error: `选定列 '${valueColumn}' 不包含有效数据。`,
			isTruncated: false,
		};
	}

	const MAX_PIE_SLICES = 15;
	let processedData: ChartDataItem[] = [];
	let isTruncated = false;

	if (analysis.uniqueValues > MAX_PIE_SLICES) {
		console.warn(`为饼图 (${analysis.uniqueValues}) 提供过多的唯一值。正在对最小的切片进行分组。`);
		const sortedFrequencies = Object.entries(analysis.frequencies).sort(
			([, countA], [, countB]) => countB - countA
		);
		const topSlices = sortedFrequencies.slice(0, MAX_PIE_SLICES - 1);
		const otherSliceCount = sortedFrequencies
			.slice(MAX_PIE_SLICES - 1)
			.reduce((sum, [, count]) => sum + count, 0);

		processedData = topSlices.map(([name, value]) => ({ name, value }));
		if (otherSliceCount > 0) {
			processedData.push({ name: "Other", value: otherSliceCount });
			isTruncated = true;
		}
	} else {
		processedData = Object.entries(analysis.frequencies)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);
	}

	return { processedData, isTruncated };
};

/**
 * Check if a column is suitable for a scatter plot axis (numeric or predominantly numeric).
 * @param columnData Data for the column.
 * @param columnName Name of the column.
 * @param minNumericPercent Minimum percentage of numeric values required (e.g., 0.2 for 20%).
 * @returns True if suitable, false otherwise.
 */
const isColumnSuitableForScatter = (
	columnData: CellValue[],
	columnName: string,
	minNumericPercent = 0.2
): {
	suitable: boolean;
	numericCount: number;
	totalCount: number;
	reason?: string;
} => {
	const cleanedData = columnData.filter(
		(v) => v !== null && v !== undefined && String(v).trim() !== ""
	);
	const totalCount = cleanedData.length;
	if (totalCount === 0) {
		return {
			suitable: false,
			numericCount: 0,
			totalCount: 0,
			reason: "列为空",
		};
	}

	let numericCount = 0;
	for (const value of cleanedData) {
		if (!isNaN(Number(value))) {
			numericCount++;
		}
	}

	const numericPercent = totalCount > 0 ? numericCount / totalCount : 0;

	if (numericPercent >= minNumericPercent) {
		return { suitable: true, numericCount, totalCount };
	} else {
		return {
			suitable: false,
			numericCount,
			totalCount,
			reason: `数值占比过低 (${(numericPercent * 100).toFixed(1)}% < ${minNumericPercent * 100}%)`,
		};
	}
};

/**
 * Process raw data specifically for generating scatter plots.
 * Requires two numeric (or predominantly numeric) columns.
 * Filters data to include only rows where both selected columns have valid numeric values.
 * @param rawData The raw headers and rows from the file
 * @param config Basic chart config with xAxisColumn and yAxisColumn selected
 * @returns An object containing processed data [{ [xCol]: number, [yCol]: number }, ...] for Recharts
 */
export const processScatterChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: { xAxisColumn: string; yAxisColumn: string }
): Pick<ChartConfig, "processedData" | "isTruncated"> & { error?: string } => {
	const { headers, rows } = rawData;
	const { xAxisColumn, yAxisColumn } = config;

	if (!xAxisColumn || !yAxisColumn) {
		return {
			processedData: [],
			error: "X 轴和 Y 轴都必须为散点图选择。",
			isTruncated: false,
		};
	}
	if (xAxisColumn === yAxisColumn) {
		return {
			processedData: [],
			error: "X 轴和 Y 轴不能是同一列。",
			isTruncated: false,
		};
	}

	const xAxisIndex = headers.indexOf(xAxisColumn);
	const yAxisIndex = headers.indexOf(yAxisColumn);
	if (xAxisIndex === -1)
		return {
			processedData: [],
			error: `X 轴列 '${xAxisColumn}' 未找到。`,
			isTruncated: false,
		};
	if (yAxisIndex === -1)
		return {
			processedData: [],
			error: `Y 轴列 '${yAxisColumn}' 未找到。`,
			isTruncated: false,
		};

	const xData = rows.map((row) => row[xAxisIndex]);
	const yData = rows.map((row) => row[yAxisIndex]);

	const xCheck = isColumnSuitableForScatter(xData, xAxisColumn);
	if (!xCheck.suitable) {
		return {
			processedData: [],
			error: `X 轴列 '${xAxisColumn}' 不适合散点图: ${xCheck.reason}`,
			isTruncated: false,
		};
	}

	const yCheck = isColumnSuitableForScatter(yData, yAxisColumn);
	if (!yCheck.suitable) {
		return {
			processedData: [],
			error: `Y 轴列 '${yAxisColumn}' 不适合散点图: ${yCheck.reason}`,
			isTruncated: false,
		};
	}

	let processedData: ChartDataItem[] = [];
	for (const row of rows) {
		const xValue = row[xAxisIndex];
		const yValue = row[yAxisIndex];
		const numX = Number(xValue);
		const numY = Number(yValue);
		if (
			xValue !== null &&
			yValue !== null &&
			xValue !== undefined &&
			yValue !== undefined &&
			String(xValue).trim() !== "" &&
			String(yValue).trim() !== "" &&
			!isNaN(numX) &&
			!isNaN(numY) &&
			isFinite(numX) &&
			isFinite(numY)
		) {
			processedData.push({
				[String(xAxisColumn)]: numX,
				[String(yAxisColumn)]: numY,
			});
		}
	}

	if (processedData.length === 0) {
		return {
			processedData: [],
			error: "根据所选列过滤后，没有有效的数值数据点可用于绘制散点图。",
			isTruncated: false,
		};
	}

	let isTruncated = false;
	if (processedData.length > MAX_DATA_POINTS) {
		console.warn(
			`Scatter plot data truncated from ${processedData.length} to ${MAX_DATA_POINTS} points.`
		);
		processedData = processedData.slice(0, MAX_DATA_POINTS);
		isTruncated = true;
	}

	return { processedData, isTruncated };
};

/**
 * Process data for Radar Chart visualization
 * For radar charts, we take a single column and count the frequency of each unique value
 * @param rawData The raw file data with headers and rows
 * @param config Configuration with the selected column
 * @returns Processed data ready for the radar chart component
 */
export const processRadarChartData = (
	rawData: { headers: string[]; rows: FileData },
	config: { xAxisColumn: string }
): Pick<ChartConfig, "processedData" | "isTruncated"> & { error?: string } => {
	const { headers, rows } = rawData;
	const { xAxisColumn } = config;

	// Find the index of the selected column
	const colIndex = headers.indexOf(xAxisColumn);
	if (colIndex === -1) {
		return {
			processedData: [],
			isTruncated: false,
			error: `列 '${xAxisColumn}' 未找到`,
		};
	}

	// Extract the column data
	const columnData = rows.map((row) => row[colIndex]);

	// Count the frequency of each unique value, ignoring nulls, N/A, empty strings, etc.
	const valueFrequencies: { [key: string]: number } = {};
	const emptyValues = ["n/a", "na", "null", "undefined", "-", ""];

	for (const value of columnData) {
		// Skip if value is null, undefined, or empty after trimming
		if (value === null || value === undefined) {
			continue;
		}

		const strValue = String(value).trim().toLowerCase();

		// Skip common empty value representations
		if (strValue === "" || emptyValues.includes(strValue)) {
			continue;
		}

		// Use the original case for display
		const displayValue = String(value).trim();
		valueFrequencies[displayValue] = (valueFrequencies[displayValue] || 0) + 1;
	}

	// Convert to the format needed for radar charts
	let processedData = Object.entries(valueFrequencies).map(([key, value]) => ({
		subject: key,
		value,
	}));

	// Sort by frequency (descending)
	processedData.sort((a, b) => b.value - a.value);

	// If no valid data found
	if (processedData.length === 0) {
		return {
			processedData: [],
			isTruncated: false,
			error: `列 '${xAxisColumn}' 不包含有效数据或所有值都为空`,
		};
	}

	// Truncate to avoid too many data points (if needed)
	const isTruncated = processedData.length > MAX_DATA_POINTS;
	if (isTruncated) {
		processedData = processedData.slice(0, MAX_DATA_POINTS);
	}

	// If we have too many categories, limit to the top 12 (common practice for radar charts)
	const MAX_RADAR_CATEGORIES = 12;
	const isCategoryTruncated = processedData.length > MAX_RADAR_CATEGORIES;
	if (isCategoryTruncated) {
		processedData = processedData.slice(0, MAX_RADAR_CATEGORIES);
	}

	return {
		processedData,
		isTruncated: isTruncated || isCategoryTruncated,
	};
};

/**
 * Export cleaned data to a file (CSV or Excel) for download
 * @param cleanedData Object containing headers and rows of cleaned data
 * @param filename The name of the file to download
 * @returns Promise that resolves when file is downloaded
 */
export const exportCleanedData = async (
	cleanedData: { headers: string[]; rows: FileData },
	filename: string
): Promise<void> => {
	if (!cleanedData || !cleanedData.headers || !cleanedData.rows) {
		throw new Error("Invalid data provided for export");
	}

	const { headers, rows } = cleanedData;
	const fileExtension = filename.split(".").pop()?.toLowerCase();

	try {
		if (fileExtension === "csv") {
			// Prepare CSV data: headers row + data rows
			const csvData = [
				headers,
				...rows.map((row) =>
					// Replace null/undefined with empty string
					row.map((cell) => (cell === null || cell === undefined ? "" : cell))
				),
			];

			// Convert to CSV string using PapaParse
			const csv = Papa.unparse(csvData);

			// Create blob and download
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			downloadFile(url, filename);
		} else if (fileExtension === "xlsx" || fileExtension === "xls") {
			// Create worksheet from data
			const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

			// Create workbook with worksheet
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Data");

			// Generate and download Excel file
			const excelBuffer = XLSX.write(workbook, { bookType: fileExtension, type: "array" });
			const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			downloadFile(url, filename);
		} else {
			throw new Error("Unsupported file type. Only CSV and Excel files are supported.");
		}
	} catch (err: any) {
		console.error("Error exporting data:", err);
		throw new Error(`Error exporting data: ${err.message || err}`);
	}
};

/**
 * Helper function to trigger file download
 * @param url The object URL of the file to download
 * @param filename The name to give the downloaded file
 */
const downloadFile = (url: string, filename: string): void => {
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();

	// Clean up
	setTimeout(() => {
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, 100);
};
