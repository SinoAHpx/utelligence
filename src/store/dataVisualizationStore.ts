import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChartConfig, ChartDataItem } from "@/types/chart-types";
import { FileData } from "@/utils/data-processing";
import { processAndAnalyzeFileData } from "@/utils/data-visualization-helpers";

/**
 * Column visualizability status configuration
 * Tracks whether a column is suitable for visualization
 */
export interface ColumnVisualizableConfig {
	column: string;
	isVisualizable: boolean;
	uniqueValues: number;
	totalValues: number;
	reason?: string;
}

/**
 * Data visualization state interface
 * Manages all state related to the data visualization features
 */
interface DataVisualizationState {
	// Raw data from the uploaded file
	rawFileData: { headers: string[]; rows: FileData } | null;
	setRawFileData: (data: { headers: string[]; rows: FileData } | null) => void;

	// Chart data (REMOVED - Each chart config now holds its own data)
	// chartData: ChartDataItem[];
	// setChartData: (data: ChartDataItem[]) => void;

	// Chart configurations
	userCharts: ChartConfig[];
	addChart: (chart: ChartConfig) => void;
	removeChart: (chartId: string) => void;
	clearCharts: () => void;

	// Chart creation state
	selectedChartType: string;
	setSelectedChartType: (type: string) => void;

	selectedColumnsForChart: string[];
	setSelectedColumnsForChart: (columns: string[]) => void;

	chartTitle: string;
	setChartTitle: (title: string) => void;

	xAxisColumn: string;
	setXAxisColumn: (column: string) => void;

	yAxisColumns: string[];
	setYAxisColumns: (columns: string[]) => void;

	// Processed file info
	processedFile: { name: string; size: number } | null;
	setProcessedFile: (file: { name: string; size: number } | null) => void;

	// Column visualization status
	columnsVisualizableStatus: ColumnVisualizableConfig[];
	setColumnsVisualizableStatus: (status: ColumnVisualizableConfig[]) => void;

	// File processing state
	isFileLoading: boolean;
	fileError: string | null;

	// Actions
	processAndAnalyzeFile: (
		file: File,
		columnsToAnalyze: string[],
	) => Promise<void>;
}

/**
 * Zustand store for data visualization
 * Persists data to localStorage for session continuity
 */
export const useDataVisualizationStore = create<DataVisualizationState>()(
	persist(
		(set, get) => ({
			// Raw file data
			rawFileData: null,
			setRawFileData: (data) => set({ rawFileData: data }),

			// Chart data (REMOVED)
			// chartData: [],
			// setChartData: (data) => set({ chartData: data }),

			// Chart configurations
			userCharts: [],
			addChart: (chart) =>
				set((state) => ({ userCharts: [...state.userCharts, chart] })),
			removeChart: (chartId) =>
				set((state) => ({
					userCharts: state.userCharts.filter((chart) => chart.id !== chartId),
				})),
			clearCharts: () => set({ userCharts: [] }),

			// Chart creation state
			selectedChartType: "bar",
			setSelectedChartType: (type) => set({ selectedChartType: type }),

			selectedColumnsForChart: [],
			setSelectedColumnsForChart: (columns) =>
				set({ selectedColumnsForChart: columns }),

			chartTitle: "",
			setChartTitle: (title) => set({ chartTitle: title }),

			xAxisColumn: "",
			setXAxisColumn: (column) => set({ xAxisColumn: column }),

			yAxisColumns: [],
			setYAxisColumns: (columns) => set({ yAxisColumns: columns }),

			// Processed file info
			processedFile: null,
			setProcessedFile: (file) => set({ processedFile: file }),

			// Column visualization status
			columnsVisualizableStatus: [],
			setColumnsVisualizableStatus: (status) =>
				set({ columnsVisualizableStatus: status }),

			// File processing state
			isFileLoading: false,
			fileError: null,

			// --- Actions ---
			processAndAnalyzeFile: async (file, columnsToAnalyze) => {
				// Set initial loading state and clear previous data/errors
				set({
					isFileLoading: true,
					fileError: null,
					rawFileData: null,
					columnsVisualizableStatus: [],
					processedFile: null, // Clear processed file info too
				});

				try {
					// Call the extracted helper function
					const { rawData, columnsVisualizableStatus } =
						await processAndAnalyzeFileData(file, columnsToAnalyze);

					// Update store with results on success
					set({
						rawFileData: rawData,
						columnsVisualizableStatus: columnsVisualizableStatus,
						processedFile: { name: file.name, size: file.size },
						fileError: null, // Ensure error is cleared on success
					});
				} catch (error: any) {
					// Handle errors thrown by the helper function
					console.error(
						"Error during processAndAnalyzeFile store action:",
						error,
					);
					set({
						fileError:
							error.message ||
							"An unknown error occurred during file processing.",
						rawFileData: null, // Clear data on error
						columnsVisualizableStatus: [],
						processedFile: null,
					});
				} finally {
					// Ensure loading state is reset regardless of success or failure
					set({ isFileLoading: false });
				}
			},
		}),
		{
			name: "data-visualization-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
