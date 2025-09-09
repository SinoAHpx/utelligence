import type { ColumnVisualizableConfig } from "@/store/visualization-chart-store"; // Need this type
import { type FileData, analyzeColumnData, processFileData } from "../data-processing";

/**
 * Processes a file, extracts raw data, and analyzes specified columns for visualizability.
 * Encapsulates the logic previously in the store action.
 *
 * @param file The file object to process.
 * @param columnsToAnalyze An array of column names to analyze for visualizability.
 * @returns A promise that resolves with an object containing rawData and columnsVisualizableStatus.
 * @throws An error if file processing or analysis fails.
 */
export const processAndAnalyzeFileData = async (
	file: File,
	columnsToAnalyze: string[] = []
): Promise<{
	rawData: { headers: string[]; rows: FileData };
	columnsVisualizableStatus: ColumnVisualizableConfig[];
}> => {
	// Wrap processFileData in a Promise to handle its callbacks
	const rawData = await new Promise<{ headers: string[]; rows: FileData }>((resolve, reject) => {
		processFileData(file, resolve, (errorMsg) => {
			console.error("File processing failed in helper:", errorMsg);
			reject(new Error(errorMsg)); // Reject the promise on error
		});
	});

	// Use all columns if none are specified
	const columnsToProcess = columnsToAnalyze.length > 0 ? columnsToAnalyze : rawData.headers;

	// Analyze columns after successful processing
	const columnsVisualizableStatus: ColumnVisualizableConfig[] = [];
	if (columnsToProcess.length > 0 && rawData.rows.length > 0) {
		try {
			// Replicate logic from analyzeColumnsForVisualization
			for (const colName of columnsToProcess) {
				const colIndex = rawData.headers.indexOf(colName);
				if (colIndex === -1) continue;
				const columnData = rawData.rows.map((row) => row[colIndex]);
				const analysis = analyzeColumnData(columnData, colName);
				columnsVisualizableStatus.push({
					column: colName,
					isVisualizable: analysis.isCategorical || analysis.isNumeric,
					uniqueValues: analysis.uniqueValues,
					totalValues: analysis.totalValues,
					reason: !analysis.isValidForVisualization
						? analysis.uniqueValues <= 1
							? "数据值单一或过少"
							: "唯一值占比过高，可能为ID列"
						: undefined,
				});
			}
		} catch (analysisError) {
			console.error("Column analysis failed within helper:", analysisError);
			// Decide how to handle analysis errors:
			// Option 1: Throw an error, halting the process.
			throw new Error("Failed to analyze column data after processing.");
			// Option 2: Return successfully but with empty status (or partial results).
			// columnsVisualizableStatus = []; // Or potentially keep partially analyzed results
		}
	}

	return { rawData, columnsVisualizableStatus };
};
