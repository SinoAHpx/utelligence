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
