/**
 * Unified Data Processing API Utilities
 * Consolidates common data processing logic for API routes
 */

import { mean, median, mode, standardDeviation } from "@/utils/data/statistics";
import { NextResponse } from "next/server";
import Papa from "papaparse";

// ============= Common Types =============

export interface ProcessingResult {
	data: any[];
	headers: string[];
	statistics?: any;
	metadata?: any;
}

export interface ProcessingOptions {
	operation: string;
	columns?: string[];
	method?: string;
	threshold?: number;
	customValue?: any;
	keepStrategy?: string;
	returnFormat?: "csv" | "json";
}

// ============= File Parsing =============

export async function parseFileData(file: File): Promise<ProcessingResult> {
	const text = await file.text();
	const results = Papa.parse(text, {
		header: true,
		skipEmptyLines: true,
	});

	return {
		data: results.data as Record<string, string>[],
		headers: results.meta.fields || [],
	};
}

// ============= Data Validation =============

export function validateColumns(headers: string[], columns: string[]): string | null {
	for (const column of columns) {
		if (!headers.includes(column)) {
			return `Column '${column}' not found`;
		}
	}
	return null;
}

export function extractNumericValues(data: Record<string, string>[], columnName: string): number[] {
	return data
		.map((row) => row[columnName])
		.filter(
			(value) =>
				value !== undefined && value !== null && value.trim() !== "" && !isNaN(Number(value))
		)
		.map((value) => Number(value));
}

// ============= Missing Values Processing =============

const INVALID_VALUES = ["n/a", "na", "null", "undefined", "-", "", "nan", "#n/a"];

export function isMissingValue(value: any): boolean {
	return (
		value === undefined ||
		value === null ||
		(typeof value === "string" &&
			(value.trim() === "" || INVALID_VALUES.includes(value.trim().toLowerCase())))
	);
}

export function processMissingValues(
	data: Record<string, string>[],
	columnName: string,
	operation: string,
	customValue?: string
): Record<string, string>[] {
	if (operation === "remove-rows") {
		return data.filter((row) => !isMissingValue(row[columnName]));
	}

	// Calculate fill value for other operations
	const numericValues = extractNumericValues(data, columnName);
	let fillValue = "";

	switch (operation) {
		case "fill-mean":
			fillValue = String(mean(numericValues) || "");
			break;
		case "fill-median":
			fillValue = String(median(numericValues) || "");
			break;
		case "fill-mode":
			fillValue = String(mode(numericValues) || "");
			break;
		case "fill-custom":
			fillValue = customValue || "";
			break;
	}

	return data.map((row) => ({
		...row,
		[columnName]: isMissingValue(row[columnName]) ? fillValue : row[columnName],
	}));
}

// ============= Outliers Processing =============

export interface OutlierResult {
	indices: number[];
	lowerBound: number;
	upperBound: number;
	statistics: any;
}

export function detectOutliers(
	data: Record<string, string>[],
	columnName: string,
	method = "zscore",
	threshold = 3
): OutlierResult {
	const values = extractNumericValues(data, columnName);
	const outlierIndices: number[] = [];
	let lowerBound = 0;
	let upperBound = 0;
	let methodDetails = {};

	if (method === "zscore") {
		const meanValue = mean(values) || 0;
		const stdDev = standardDeviation(values) || 1;

		lowerBound = meanValue - threshold * stdDev;
		upperBound = meanValue + threshold * stdDev;
		methodDetails = { mean: meanValue, stdDev };

		data.forEach((row, i) => {
			const value = Number(row[columnName]);
			if (!isNaN(value)) {
				const zScore = Math.abs((value - meanValue) / stdDev);
				if (zScore > threshold) {
					outlierIndices.push(i);
				}
			}
		});
	} else if (method === "iqr") {
		const sortedValues = [...values].sort((a, b) => a - b);
		const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
		const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
		const iqr = q3 - q1;

		lowerBound = q1 - threshold * iqr;
		upperBound = q3 + threshold * iqr;
		methodDetails = { q1, q3, iqr };

		data.forEach((row, i) => {
			const value = Number(row[columnName]);
			if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
				outlierIndices.push(i);
			}
		});
	} else if (method === "percentile") {
		const sortedValues = [...values].sort((a, b) => a - b);
		const lowerPercentile = threshold;
		const upperPercentile = 100 - threshold;

		const lowerIndex = Math.floor(sortedValues.length * (lowerPercentile / 100));
		const upperIndex = Math.floor(sortedValues.length * (upperPercentile / 100));

		lowerBound = sortedValues[lowerIndex];
		upperBound = sortedValues[upperIndex];
		methodDetails = { lowerPercentile, upperPercentile };

		data.forEach((row, i) => {
			const value = Number(row[columnName]);
			if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
				outlierIndices.push(i);
			}
		});
	}

	return {
		indices: outlierIndices,
		lowerBound,
		upperBound,
		statistics: {
			method,
			threshold,
			lowerBound,
			upperBound,
			outlierCount: outlierIndices.length,
			totalCount: data.length,
			methodDetails,
		},
	};
}

export function processOutliers(
	data: Record<string, string>[],
	columnName: string,
	operation: string,
	method = "zscore",
	threshold = 3
): Record<string, string>[] {
	const { indices, lowerBound, upperBound } = detectOutliers(data, columnName, method, threshold);

	if (operation === "remove-outliers") {
		return data.filter((_, index) => !indices.includes(index));
	} else if (operation === "cap-outliers") {
		return data.map((row, index) => {
			if (indices.includes(index)) {
				const value = Number(row[columnName]);
				if (!isNaN(value)) {
					if (value < lowerBound) {
						return { ...row, [columnName]: String(lowerBound) };
					} else if (value > upperBound) {
						return { ...row, [columnName]: String(upperBound) };
					}
				}
			}
			return row;
		});
	}

	return data;
}

// ============= Duplicates Processing =============

export interface DuplicateResult {
	groups: Array<{
		key: string;
		indices: number[];
		rows: any[];
		count: number;
	}>;
	statistics: {
		totalRows: number;
		uniqueRows: number;
		duplicateRows: number;
		duplicateGroupsCount: number;
		duplicateCount: number;
	};
}

export function findDuplicates(data: Record<string, string>[], columns: string[]): DuplicateResult {
	const duplicateMap = new Map<string, number[]>();

	// Group rows by their values in the specified columns
	data.forEach((row, index) => {
		const key = columns
			.map((col) => {
				const value = row[col];
				return value === undefined || value === null ? "" : String(value).trim();
			})
			.join("|");

		if (duplicateMap.has(key)) {
			duplicateMap.get(key)!.push(index);
		} else {
			duplicateMap.set(key, [index]);
		}
	});

	// Extract only the groups with duplicates
	const duplicateGroups = Array.from(duplicateMap.entries())
		.filter(([_, indices]) => indices.length > 1)
		.map(([key, indices]) => ({
			key,
			indices,
			rows: indices.map((idx) => ({ ...data[idx], _index: idx })),
			count: indices.length,
		}));

	const totalRows = data.length;
	const uniqueRows = duplicateMap.size;
	const duplicateRows = totalRows - uniqueRows;
	const duplicateCount = duplicateGroups.reduce((sum, group) => sum + group.indices.length, 0);

	return {
		groups: duplicateGroups,
		statistics: {
			totalRows,
			uniqueRows,
			duplicateRows,
			duplicateGroupsCount: duplicateGroups.length,
			duplicateCount,
		},
	};
}

export function processDuplicates(
	data: Record<string, string>[],
	columns: string[],
	keepStrategy = "first"
): Record<string, string>[] {
	const { groups } = findDuplicates(data, columns);
	const indicesToRemove = new Set<number>();

	groups.forEach((group) => {
		if (group.indices.length <= 1) return;

		let indicesToKeep: number[] = [];

		if (keepStrategy === "first") {
			indicesToKeep = [group.indices[0]];
		} else if (keepStrategy === "last") {
			indicesToKeep = [group.indices[group.indices.length - 1]];
		} else if (keepStrategy === "min-nulls") {
			let minNulls = Number.MAX_SAFE_INTEGER;
			let minNullIndex = -1;

			group.indices.forEach((idx) => {
				const row = data[idx];
				const nullCount = Object.values(row).filter((val) => isMissingValue(val)).length;

				if (nullCount < minNulls) {
					minNulls = nullCount;
					minNullIndex = idx;
				}
			});

			if (minNullIndex !== -1) {
				indicesToKeep = [minNullIndex];
			}
		}

		group.indices.forEach((idx) => {
			if (!indicesToKeep.includes(idx)) {
				indicesToRemove.add(idx);
			}
		});
	});

	return data.filter((_, index) => !indicesToRemove.has(index));
}

// ============= Response Helpers =============

export function createCSVResponse(data: any[], filename: string): NextResponse {
	const csv = Papa.unparse(data);
	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
}

export function createJSONResponse(data: any, status = 200): NextResponse {
	return NextResponse.json(data, { status });
}

export function createErrorResponse(error: string, status = 400): NextResponse {
	return NextResponse.json({ error }, { status });
}
