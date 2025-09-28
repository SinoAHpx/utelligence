import type { ColumnVisualizableConfig } from "@/types/visualization";
import type { FileData } from "@/utils/data/data-processing";
import { processFile } from "@/utils/data/file-upload/upload-utils";
import { processAndAnalyzeFileData } from "@/utils/data/visualization/data-visualization-helpers";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { visualizationChartStore } from "./visualization-chart-store";

// Types
interface ParsedData {
	headers: string[];
	rows: string[][];
}

interface DuplicateGroup {
	key: string;
	indices: number[];
	rows: any[];
	count: number;
}

interface DuplicatesStatistics {
	totalRows: number;
	uniqueRows: number;
	duplicateRows: number;
	duplicateGroupsCount: number;
	duplicateCount: number;
}

interface OutliersMethodDetails {
	mean?: number;
	stdDev?: number;
	q1?: number;
	q3?: number;
	iqr?: number;
	lowerPercentile?: number;
	upperPercentile?: number;
}

interface OutliersStatistics {
	lowerBound: number;
	upperBound: number;
	method: string;
	threshold: number;
	outlierCount: number;
	totalCount: number;
	methodDetails: OutliersMethodDetails;
}

/**
 * Unified Data Store Interface
 * Consolidates all data-related state management
 */
interface UnifiedDataState {
	// File Management
	currentFile: File | null;
	currentFileIdentifier: string | null;

	// Data States
	rawData: ParsedData | null;
	processedData: { headers: string[]; rows: FileData } | null;
	cleanedData: { headers: string[]; rows: any[] } | null;
	columnAnalysis: ColumnVisualizableConfig[];

	// Loading & Error States
	isLoading: boolean;
	error: string | null;

	// Duplicates Analysis
	duplicates: {
		selectedColumns: string[];
		groups: DuplicateGroup[];
		statistics: DuplicatesStatistics;
		activeTab: string;
		expandedGroup: string | null;
	};

	// Outliers Analysis
	outliers: {
		columnName: string;
		method: string;
		threshold: number;
		statistics: OutliersStatistics;
		activeTab: string;
		chartData: any[];
	};

	// Actions - File Management
	uploadFile: (file: File) => Promise<void>;
	clearFile: () => void;

	// Actions - Data Processing
	processAndAnalyze: (columnsToAnalyze: string[]) => Promise<void>;
	cleanData: (operationType: string, params: any) => Promise<void>;
	processMissingValues: (settings: {
		[key: string]: { strategy: string; value?: string | number };
	}, callbacks?: {
		onProgress?: (progress: number) => void;
		onComplete?: () => void;
		onError?: (error: string) => void;
	}) => Promise<void>;

	// Actions - Duplicates
	setDuplicatesColumns: (columns: string[]) => void;
	analyzeDuplicates: () => void;
	removeDuplicates: (indices: number[]) => void;

	// Actions - Outliers
	setOutliersColumn: (column: string) => void;
	setOutliersMethod: (method: string, threshold: number) => void;
	analyzeOutliers: () => void;
	removeOutliers: (indices: number[]) => void;

	// Actions - UI State
	setActiveTab: (section: "duplicates" | "outliers", tab: string) => void;
	setExpandedGroup: (groupId: string | null) => void;
}

/**
 * Unified Data Store
 * Single source of truth for all data operations
 */
export const useUnifiedDataStore = create<UnifiedDataState>()(
	persist(
		(set, get) => ({
			// Initial State
			currentFile: null,
			currentFileIdentifier: null,
			rawData: null,
			processedData: null,
			cleanedData: null,
			columnAnalysis: [],
			isLoading: false,
			error: null,

			duplicates: {
				selectedColumns: [],
				groups: [],
				statistics: {
					totalRows: 0,
					uniqueRows: 0,
					duplicateRows: 0,
					duplicateGroupsCount: 0,
					duplicateCount: 0,
				},
				activeTab: "summary",
				expandedGroup: null,
			},

			outliers: {
				columnName: "",
				method: "zscore",
				threshold: 3,
				statistics: {
					lowerBound: 0,
					upperBound: 0,
					method: "zscore",
					threshold: 3,
					outlierCount: 0,
					totalCount: 0,
					methodDetails: {},
				},
				activeTab: "chart",
				chartData: [],
			},

			// File Management Actions
			uploadFile: async (file) => {
				const fileKey = `${file.name}-${file.size}`;
				const { currentFileIdentifier, rawData, processedData } = get();

				// Avoid reprocessing the same file only if we already have data loaded
				if (fileKey === currentFileIdentifier && (rawData || processedData)) {
					return;
				}

				set({
					isLoading: true,
					error: null,
					currentFile: file,
					currentFileIdentifier: fileKey,
					columnAnalysis: [],
					// Reset derived data when (re)uploading
					processedData: null,
					cleanedData: null,
				});

				visualizationChartStore.getState().setCurrentFileIdentifier(fileKey);

				try {
					const result = await processFile(file);
					set({
						rawData: result,
						isLoading: false,
					});
					// Don't set visualization chart store data here - let processAndAnalyze handle it

					// Sync with backend if needed
					await fetch("/api/data/upload", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(result),
					}).catch(() => {
						// Silent fail for API sync
					});
				} catch (err) {
					set({
						error: `File processing error: ${err instanceof Error ? err.message : String(err)}`,
						isLoading: false,
						rawData: null,
					});
				}
			},

			clearFile: () => {
				visualizationChartStore.getState().resetCurrentFile();
				set({
					currentFile: null,
					currentFileIdentifier: null,
					rawData: null,
					processedData: null,
					cleanedData: null,
					error: null,
					columnAnalysis: [],
				});
			},

			// Data Processing Actions
			processAndAnalyze: async (columnsToAnalyze) => {
				const { currentFile } = get();
				if (!currentFile) {
					set({ error: "No file loaded" });
					return;
				}

				set({ isLoading: true, error: null });

				try {
					const { rawData, columnsVisualizableStatus } = await processAndAnalyzeFileData(
						currentFile,
						columnsToAnalyze
					);

					set({
						processedData: rawData,
						columnAnalysis: columnsVisualizableStatus,
						isLoading: false,
					});

					const fileIdentifier = get().currentFileIdentifier;
					if (fileIdentifier) {
						visualizationChartStore.getState().initializeFileContext({
							identifier: fileIdentifier,
							columns: rawData.headers,
							columnStatus: columnsVisualizableStatus,
						});
					}
				} catch (error: any) {
					set({
						error: error.message || "Processing failed",
						isLoading: false,
						columnAnalysis: [],
					});
					visualizationChartStore.getState().setColumnsVisualizableStatus([]);
				}
			},

			cleanData: async (operationType, params) => {
				const { processedData, cleanedData } = get();
				const dataToClean = cleanedData || processedData;

				if (!dataToClean) {
					set({ error: "No data to clean" });
					return;
				}

				set({ isLoading: true });

				try {
					// Implement cleaning logic based on operation type
					const result = { ...dataToClean };

					switch (operationType) {
						case "missing":
							// Handle missing values
							console.log(`Processing missing values for column ${params.column}`);
							break;
						case "outliers":
							// Handle outliers
							const { removeOutliers } = get();
							if (params.indices) {
								removeOutliers(params.indices);
							}
							break;
						case "duplicates":
							// Handle duplicates
							const { removeDuplicates } = get();
							if (params.indices) {
								removeDuplicates(params.indices);
							}
							break;
						default:
							throw new Error(`Unknown operation: ${operationType}`);
					}

					set({
						cleanedData: result,
						isLoading: false,
					});
				} catch (error: any) {
					set({
						error: error.message || "Cleaning failed",
						isLoading: false,
					});
				}
			},

			// Process missing values with enhanced logic
			processMissingValues: async (settings, callbacks) => {
				const { processedData, cleanedData, rawData } = get();

				// Determine the source data
				let sourceData = cleanedData || processedData;

				// If no processed data, fallback to raw data
				if (!sourceData && rawData) {
					sourceData = {
						headers: rawData.headers,
						rows: rawData.rows,
					};
				}

				if (!sourceData) {
					const error = "No data available for processing";
					set({ error });
					callbacks?.onError?.(error);
					return;
				}

				set({ isLoading: true, error: null });

				try {
					// Create a deep copy of the data
					const currentData = {
						headers: [...sourceData.headers],
						rows: JSON.parse(JSON.stringify(sourceData.rows)),
					};

					const columnKeys = Object.keys(settings);
					const totalSteps = columnKeys.length;
					let currentStep = 0;

					// Helper function to check if a cell contains missing value
					const isCellMissing = (cell: any): boolean => {
						return (
							cell === null ||
							cell === undefined ||
							cell === "" ||
							(typeof cell === "string" && cell.trim() === "") ||
							(typeof cell === "string" &&
								["na", "n/a", "null", "-", "nan"].includes(cell.trim().toLowerCase()))
						);
					};

					// Helper function to calculate statistical values
					const calculateStatistic = (values: number[], method: string): number => {
						switch (method) {
							case "mean":
								return values.reduce((a, b) => a + b, 0) / values.length;
							case "median": {
								const sorted = [...values].sort((a, b) => a - b);
								const mid = Math.floor(sorted.length / 2);
								return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
							}
							case "min":
								return Math.min(...values);
							case "max":
								return Math.max(...values);
							default:
								return 0;
						}
					};

					// Helper function to find mode (most frequent value)
					const calculateMode = (values: (string | number)[]): string | number => {
						const frequency: Record<string, number> = {};

						for (const val of values) {
							const key = String(val);
							frequency[key] = (frequency[key] || 0) + 1;
						}

						const modeEntry = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
						if (!modeEntry) return "";

						// Try to convert back to number if possible
						const numVal = Number(modeEntry[0]);
						return !isNaN(numVal) ? numVal : modeEntry[0];
					};

					// Process each column
					for (const column of columnKeys) {
						currentStep += 1;
						callbacks?.onProgress?.(Math.round((currentStep / totalSteps) * 100));

						const columnSetting = settings[column];
						const colIndex = currentData.headers.indexOf(column);

						if (colIndex === -1) {
							console.warn(`Column "${column}" not found in data`);
							continue;
						}

						// Count missing values before processing
						const missingCount = currentData.rows.filter((row: any[]) => isCellMissing(row[colIndex])).length;
						const totalRows = currentData.rows.length;
						const missingPercentage = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

						console.log(`Column "${column}": ${missingCount} missing values (${missingPercentage.toFixed(1)}%)`);

						if (columnSetting.strategy === "drop") {
							// Check threshold before dropping
							const threshold = Number(columnSetting.value) || 50;

							if (missingPercentage <= threshold) {
								// Drop rows with missing values
								currentData.rows = currentData.rows.filter((row: any[]) => !isCellMissing(row[colIndex]));
								console.log(`Dropped ${missingCount} rows with missing values in column "${column}"`);
							} else {
								console.warn(`Skipping drop for column "${column}" - missing percentage (${missingPercentage.toFixed(1)}%) exceeds threshold (${threshold}%)`);
							}
						} else if (columnSetting.strategy === "fill-value") {
							// Fill with specific value
							const rawValue = columnSetting.value ?? "";
							const numericValue = Number(rawValue);
							const fillValue = !isNaN(numericValue) ? numericValue : rawValue;

							currentData.rows = currentData.rows.map((row: any[]) => {
								const newRow = [...row];
								if (isCellMissing(row[colIndex])) {
									newRow[colIndex] = fillValue;
								}
								return newRow;
							});

							console.log(`Filled ${missingCount} missing values in column "${column}" with value: ${fillValue}`);
						} else if (columnSetting.strategy === "fill-method") {
							// Fill with statistical method
							const method = String(columnSetting.value || "mode");

							// Collect non-missing values
							const nonMissingValues: (string | number)[] = [];
							const numericValues: number[] = [];

							currentData.rows.forEach((row: any[]) => {
								const cell = row[colIndex];
								if (!isCellMissing(cell)) {
									nonMissingValues.push(cell);
									const num = Number(cell);
									if (!isNaN(num)) {
										numericValues.push(num);
									}
								}
							});

							let replacementValue: any = "";

							if (method === "mode" || numericValues.length === 0) {
								// Use mode for all data types or when no numeric values
								replacementValue = calculateMode(nonMissingValues);
							} else if (numericValues.length > 0) {
								// Use statistical method for numeric data
								replacementValue = calculateStatistic(numericValues, method);
							}

							// Apply replacement
							currentData.rows = currentData.rows.map((row: any[]) => {
								const newRow = [...row];
								if (isCellMissing(row[colIndex])) {
									newRow[colIndex] = replacementValue;
								}
								return newRow;
							});

							console.log(`Filled ${missingCount} missing values in column "${column}" using ${method}: ${replacementValue}`);
						}
					}

					// Update the store with cleaned data
					set({
						cleanedData: currentData,
						isLoading: false,
					});

					callbacks?.onProgress?.(100);
					callbacks?.onComplete?.();
				} catch (error: any) {
					const errorMessage = error.message || "Failed to process missing values";
					set({
						error: errorMessage,
						isLoading: false,
					});
					callbacks?.onError?.(errorMessage);
				}
			},

			// Duplicates Actions
			setDuplicatesColumns: (columns) => {
				set((state) => ({
					duplicates: { ...state.duplicates, selectedColumns: columns },
				}));
			},

			analyzeDuplicates: () => {
				const { cleanedData, processedData } = get();
				const data = cleanedData || processedData;

				if (!data) return;

				// Implement duplicate analysis logic
				// This is a placeholder - actual implementation would go here
				console.log("Analyzing duplicates...");
			},

			removeDuplicates: (indices) => {
				const { cleanedData, processedData } = get();
				const data = cleanedData || processedData;

				if (!data) return;

				const newRows = data.rows.filter((_, index) => !indices.includes(index));
				set({
					cleanedData: {
						headers: data.headers,
						rows: newRows,
					},
				});
			},

			// Outliers Actions
			setOutliersColumn: (column) => {
				set((state) => ({
					outliers: { ...state.outliers, columnName: column },
				}));
			},

			setOutliersMethod: (method, threshold) => {
				set((state) => ({
					outliers: { ...state.outliers, method, threshold },
				}));
			},

			analyzeOutliers: () => {
				const { cleanedData, processedData, outliers } = get();
				const data = cleanedData || processedData;

				if (!data || !outliers.columnName) return;

				// Implement outlier analysis logic
				// This is a placeholder - actual implementation would go here
				console.log("Analyzing outliers...");
			},

			removeOutliers: (indices) => {
				const { cleanedData, processedData } = get();
				const data = cleanedData || processedData;

				if (!data) return;

				const newRows = data.rows.filter((_, index) => !indices.includes(index));
				set({
					cleanedData: {
						headers: data.headers,
						rows: newRows,
					},
				});
			},

			// UI State Actions
			setActiveTab: (section, tab) => {
				if (section === "duplicates") {
					set((state) => ({
						duplicates: { ...state.duplicates, activeTab: tab },
					}));
				} else if (section === "outliers") {
					set((state) => ({
						outliers: { ...state.outliers, activeTab: tab },
					}));
				}
			},

			setExpandedGroup: (groupId) => {
				set((state) => ({
					duplicates: { ...state.duplicates, expandedGroup: groupId },
				}));
			},
		}),
		{
			name: "unified-data-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				currentFileIdentifier: state.currentFileIdentifier,
				// Only persist essential data
			}),
		}
	)
);;
