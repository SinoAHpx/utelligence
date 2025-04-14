import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ChartDataItem, ChartConfig } from "@/types/chart-types";

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
export const analyzeColumnData = (
	columnData: CellValue[],
	columnName: string,
) => {
	const cleanedData = columnData.filter(
		(v) => v !== undefined && v !== null && String(v).trim() !== "",
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
		!allNumeric ||
		(allNumeric && uniqueCount <= Math.max(15, totalValues * 0.1)); // Adjust threshold as needed
	const isValidForVisualization =
		uniqueCount > 1 && uniqueCount < totalValues * 0.9; // Generally, avoid constant or unique-per-row columns

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
 * Process file data from a CSV or Excel file and store raw data
 * @param file File to process
 * @param onSuccess Callback with raw headers and rows
 * @param onError Callback for processing errors
 */
export const processFileData = async (
	file: File,
	onSuccess: (data: { headers: string[]; rows: FileData }) => void,
	onError: (error: string) => void,
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
					`CSV Parsing Error: ${results.errors[0].message} on row ${results.errors[0].row}`,
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
				typeof cell === "string"
					? cell.trim()
					: cell !== null && cell !== undefined
						? cell
						: null,
			),
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
	config: Pick<ChartConfig, "xAxisColumn" | "yAxisColumn">,
): Pick<ChartConfig, "processedData" | "layout" | "yCategories" | "yKey"> & {
	error?: string;
} => {
	const { headers, rows } = rawData;
	const { xAxisColumn, yAxisColumn } = config;

	if (!xAxisColumn || !yAxisColumn) {
		return { error: "X and Y axes must be selected for bar charts." };
	}

	const xAxisIndex = headers.indexOf(xAxisColumn);
	const yAxisIndex = headers.indexOf(yAxisColumn);

	if (xAxisIndex === -1 || yAxisIndex === -1) {
		return { error: "Selected axis column(s) not found in data." };
	}

	// Analyze the Y-axis column to determine its type
	const yColumnData = rows.map((row) => row[yAxisIndex]);
	const yAxisAnalysis = analyzeColumnData(yColumnData, yAxisColumn);

	if (yAxisAnalysis.isEmpty) {
		return { error: `Y-axis column '${yAxisColumn}' contains no valid data.` };
	}

	// Add check for excessive unique values on Y-axis for bar charts
	if (yAxisAnalysis.uniqueValues > MAX_Y_CATEGORIES_FOR_BAR_CHART) {
		return {
			error:
				`Y-axis column '${yAxisColumn}' has too many unique values (${yAxisAnalysis.uniqueValues}) ` +
				`for a bar chart. Maximum allowed is ${MAX_Y_CATEGORIES_FOR_BAR_CHART}.`,
		};
	}

	// Group data by X-axis values
	const groupedData: { [xValue: string]: FileData } = {};
	for (const row of rows) {
		const xValue = String(row[xAxisIndex] ?? "").trim(); // Handle potential null/undefined
		if (xValue === "") continue; // Skip rows with empty X-axis value

		if (!groupedData[xValue]) {
			groupedData[xValue] = [];
		}
		groupedData[xValue].push(row);
	}

	const processedData: ChartDataItem[] = [];
	let layout: "stacked" | "simple" = "simple";
	let yCategories: string[] = [];
	const yKey = "count"; // Use 'count' for simple bars

	// Decide on layout based on Y-axis analysis
	if (yAxisAnalysis.isCategorical && yAxisAnalysis.uniqueValues > 1) {
		layout = "stacked";
		yCategories = yAxisAnalysis.uniqueValueList.sort(); // Use sorted unique values as categories

		// Process for stacked bar chart
		for (const xValue of Object.keys(groupedData).sort()) {
			const groupRows = groupedData[xValue];
			const counts: { [yCategory: string]: number } = {};
			yCategories.forEach((cat) => (counts[cat] = 0)); // Initialize counts for all categories

			for (const row of groupRows) {
				const yValue = String(row[yAxisIndex] ?? "").trim();
				if (yValue !== "" && counts.hasOwnProperty(yValue)) {
					counts[yValue]++;
				}
			}

			processedData.push({ name: xValue, ...counts });
		}
	} else {
		// Process for simple bar chart (counting occurrences per X-category)
		layout = "simple";
		for (const xValue of Object.keys(groupedData).sort()) {
			// Count non-empty Y values within this X group
			const count = groupedData[xValue].filter(
				(row) =>
					row[yAxisIndex] !== null &&
					row[yAxisIndex] !== undefined &&
					String(row[yAxisIndex]).trim() !== "",
			).length;
			processedData.push({ name: xValue, [yKey]: count });
		}
	}

	// Limit data points for performance/readability if necessary (optional)
	// const MAX_POINTS = 50;
	// if (processedData.length > MAX_POINTS) {
	// 	processedData = processedData.slice(0, MAX_POINTS);
	// 	// Consider adding a notification that data was truncated
	// }

	return {
		processedData,
		layout,
		...(layout === "stacked" ? { yCategories } : { yKey }),
	};
};
