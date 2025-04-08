import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ChartDataItem } from "@/types/chart-types";

/**
 * Type definitions for file data
 */
export type CellValue = string | number;
export type FileRow = CellValue[];
export type FileData = FileRow[];

/**
 * Process file data from a CSV or Excel file
 * @param file File to process
 * @param selectedColumns Columns to include in the chart data
 * @param onSuccess Callback for successful data processing
 * @param onError Callback for processing errors
 */
export const processFileData = async (
	file: File,
	selectedColumns: string[],
	onSuccess: (chartData: ChartDataItem[]) => void,
	onError: (error: string) => void,
) => {
	if (!file || selectedColumns.length === 0) {
		onError("No file or columns selected");
		return;
	}

	try {
		const fileExtension = file.name.split(".").pop()?.toLowerCase();

		if (fileExtension === "csv") {
			// Parse CSV file
			const text = await file.text();
			Papa.parse(text, {
				complete: (results) => {
					const headers = results.data[0] as string[];
					const rows = results.data.slice(1) as string[][];

					// Create chart data
					const chartData = createChartData(
						headers,
						rows as FileData,
						selectedColumns,
					);
					onSuccess(chartData);
				},
				error: (error: { message: string }) => {
					console.error("Failed to parse CSV file:", error);
					onError(`Failed to parse CSV file: ${error.message}`);
				},
			});
		} else if (fileExtension === "xlsx" || fileExtension === "xls") {
			// Parse Excel file
			const arrayBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer);
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];

			// Convert to JSON
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

			// Extract headers and data
			const headers = jsonData[0] as string[];
			const rows = jsonData.slice(1) as FileData;

			// Create chart data
			const chartData = createChartData(headers, rows, selectedColumns);
			onSuccess(chartData);
		} else {
			console.error("Unsupported file type");
			onError("Unsupported file type. Please upload a CSV or Excel file.");
		}
	} catch (err) {
		console.error("File parsing error:", err);
		onError(`Error processing file: ${err}`);
	}
};

/**
 * Create chart data from parsed file data
 * @param headers Column headers
 * @param rows Data rows
 * @param selectedColumns Columns to include in the chart data
 * @returns Formatted chart data for visualization
 */
export const createChartData = (
	headers: string[],
	rows: FileData,
	selectedColumns: string[],
): ChartDataItem[] => {
	// Use mock data if rows are empty
	if (rows.length === 0) {
		return createMockChartData(selectedColumns);
	}

	return rows.slice(0, 20).map((row, index) => {
		const rowData: ChartDataItem = { name: `Item ${index + 1}` };

		// Use first column as name if available
		if (headers[0] && row[0]) {
			rowData.name = String(row[0] || "").slice(0, 10); // Truncate long names
		}

		// Add selected column data
		for (const column of selectedColumns) {
			const colIndex = headers.indexOf(column);
			if (colIndex !== -1 && colIndex < row.length) {
				// Try to convert value to number
				const strValue = String(row[colIndex]);
				const numValue = Number.parseFloat(strValue);
				rowData[column] = Number.isNaN(numValue)
					? Math.floor(Math.random() * 100) // Use random number if conversion fails
					: numValue;
			} else {
				// If no data, use random value
				rowData[column] = Math.floor(Math.random() * 100);
			}
		}

		return rowData;
	});
};

/**
 * Create mock chart data when no real data is available
 * @param selectedColumns Columns to include in the mock data
 * @returns Mock chart data for visualization
 */
export const createMockChartData = (
	selectedColumns: string[],
): ChartDataItem[] => {
	const mockData: ChartDataItem[] = [];
	for (let i = 0; i < 10; i++) {
		const item: ChartDataItem = { name: `Item ${i + 1}` };
		for (const col of selectedColumns) {
			item[col] = Math.floor(Math.random() * 100);
		}
		mockData.push(item);
	}
	return mockData;
};

/**
 * Analyze column data to determine if it's suitable for visualization
 * @param columnData Data for a single column
 * @returns Analysis results including uniqueness and visualization suitability
 */
export const analyzeColumnData = (columnData: CellValue[]) => {
	if (!columnData || columnData.length === 0) {
		return {
			isEmpty: true,
			uniqueValues: 0,
			isValidForVisualization: false,
			frequencies: {},
			processedData: [],
		};
	}

	// Count frequency of each value
	const freqMap: { [key: string]: number } = {};

	for (const value of columnData) {
		const key = String(value).trim();
		// Skip empty values
		if (!key) continue;
		freqMap[key] = (freqMap[key] || 0) + 1;
	}

	// Count unique values
	const uniqueCount = Object.keys(freqMap).length;

	// Check if data is empty
	const nonEmptyCount = Object.keys(freqMap).filter(
		(key) => key.trim() !== "",
	).length;
	const isEmpty = nonEmptyCount === 0;

	// Check if data is valid for visualization
	const isValid = uniqueCount < columnData.length * 0.9 && !isEmpty;

	// Process data for charts
	const chartData = Object.entries(freqMap).map(([name, value]) => ({
		name,
		value,
	}));

	// Sort by frequency for better visualization
	chartData.sort((a, b) => b.value - a.value);

	return {
		isEmpty,
		uniqueValues: uniqueCount,
		isValidForVisualization: isValid,
		frequencies: freqMap,
		processedData: chartData.slice(0, 10), // Limit to top 10
	};
};
