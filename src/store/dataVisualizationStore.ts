import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
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
	// Raw data from the uploaded file (non-persistent)
	rawFileData: { headers: string[]; rows: FileData } | null;
	setRawFileData: (data: { headers: string[]; rows: FileData } | null) => void;

	// Chart configurations per file identifier (persistent)
	fileChartConfigs: Record<string, ChartConfig[]>;

	// Identifier for the currently active file (persistent)
	currentFileIdentifier: string | null;
	setCurrentFileIdentifier: (identifier: string | null) => void;

	// Active charts for the current file (derived, non-persistent)
	userCharts: ChartConfig[];

	// Actions for active charts
	addChart: (chart: ChartConfig) => void;
	removeChart: (chartId: string) => void;
	clearCurrentFileCharts: () => void;

	// Chart creation state (mostly non-persistent, could be reset on file change)
	selectedChartType: string;
	setSelectedChartType: (type: string) => void;

	selectedColumnsForChart: string[];
	setSelectedColumnsForChart: (columns: string[]) => void;

	chartTitle: string;
	setChartTitle: (title: string) => void;

	xAxisColumn: string;
	setXAxisColumn: (column: string) => void;

	yAxisColumn: string;
	setYAxisColumn: (column: string) => void;

	// Column visualization status (non-persistent)
	columnsVisualizableStatus: ColumnVisualizableConfig[];
	setColumnsVisualizableStatus: (status: ColumnVisualizableConfig[]) => void;

	// File processing state (non-persistent)
	isFileLoading: boolean;
	fileError: string | null;

	// Actions
	processAndAnalyzeFile: (
		file: File,
		columnsToAnalyze: string[],
	) => Promise<void>;

	// Helper to load charts for the current file
	loadChartsForCurrentFile: () => void;
}

/**
 * Zustand store for data visualization
 * Persists data to localStorage for session continuity
 */
export const useDataVisualizationStore = create<DataVisualizationState>()(
	persist(
		(set, get) => ({
			// --- State ---

			// Non-persistent state
			rawFileData: null,
			userCharts: [],
			columnsVisualizableStatus: [],
			isFileLoading: false,
			fileError: null,
			selectedChartType: "bar",
			selectedColumnsForChart: [],
			chartTitle: "",
			xAxisColumn: "",
			yAxisColumn: "",

			// Persistent state
			fileChartConfigs: {},
			currentFileIdentifier: null,

			// --- Setters for non-persistent state ---
			setRawFileData: (data) => set({ rawFileData: data }),
			setColumnsVisualizableStatus: (status) =>
				set({ columnsVisualizableStatus: status }),
			setSelectedChartType: (type) => set({ selectedChartType: type }),
			setSelectedColumnsForChart: (columns) =>
				set({ selectedColumnsForChart: columns }),
			setChartTitle: (title) => set({ chartTitle: title }),
			setXAxisColumn: (column) => set({ xAxisColumn: column }),
			setYAxisColumn: (column) => set({ yAxisColumn: column }),

			// --- Setter for persistent state ---
			setCurrentFileIdentifier: (identifier) =>
				set({ currentFileIdentifier: identifier }),

			// --- Actions operating on the CURRENT file's charts ---
			addChart: (chart) => {
				const currentId = get().currentFileIdentifier;
				if (!currentId) return;
				set((state) => {
					const currentConfigs = state.fileChartConfigs[currentId] || [];
					const updatedConfigs = [...currentConfigs, chart];
					return {
						fileChartConfigs: {
							...state.fileChartConfigs,
							[currentId]: updatedConfigs,
						},
						userCharts: updatedConfigs,
					};
				});
			},
			removeChart: (chartId) => {
				const currentId = get().currentFileIdentifier;
				if (!currentId) return;
				set((state) => {
					const currentConfigs = state.fileChartConfigs[currentId] || [];
					const updatedConfigs = currentConfigs.filter(
						(chart) => chart.id !== chartId,
					);
					return {
						fileChartConfigs: {
							...state.fileChartConfigs,
							[currentId]: updatedConfigs,
						},
						userCharts: updatedConfigs,
					};
				});
			},
			clearCurrentFileCharts: () => {
				const currentId = get().currentFileIdentifier;
				if (!currentId) return;
				set((state) => ({
					fileChartConfigs: {
						...state.fileChartConfigs,
						[currentId]: [],
					},
					userCharts: [],
				}));
			},

			// --- Helper to load charts for current file ---
			loadChartsForCurrentFile: () => {
				const currentId = get().currentFileIdentifier;
				const fileConfigs = get().fileChartConfigs;
				if (currentId && fileConfigs[currentId]) {
					set({ userCharts: fileConfigs[currentId] });
				} else {
					set({ userCharts: [] });
				}
			},

			// --- File Processing Action ---
			processAndAnalyzeFile: async (file, columnsToAnalyze) => {
				const fileIdentifier = `${file.name}-${file.size}`;

				set({
					isFileLoading: true,
					fileError: null,
					rawFileData: null,
					columnsVisualizableStatus: [],
					userCharts: [],
				});

				try {
					const { rawData, columnsVisualizableStatus } =
						await processAndAnalyzeFileData(file, columnsToAnalyze);

					set({
						currentFileIdentifier: fileIdentifier,
						rawFileData: rawData,
						columnsVisualizableStatus: columnsVisualizableStatus,
						fileError: null,
					});
					get().loadChartsForCurrentFile();
				} catch (error: any) {
					console.error(
						"Error during processAndAnalyzeFile store action:",
						error,
					);
					set({
						fileError:
							error.message ||
							"An unknown error occurred during file processing.",
						currentFileIdentifier: null,
						rawFileData: null,
						columnsVisualizableStatus: [],
						userCharts: [],
					});
				} finally {
					set({ isFileLoading: false });
				}
			},
		}),
		{
			name: "data-visualization-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				fileChartConfigs: state.fileChartConfigs,
				currentFileIdentifier: state.currentFileIdentifier,
			}),
			onRehydrateStorage: (state) => {
				console.log("Hydrating state...");
				return (state, error) => {
					if (error) {
						console.error("Failed to hydrate state:", error);
					} else if (state) {
						console.log(
							"Hydration success, loading charts for:",
							state.currentFileIdentifier,
						);
					}
				};
			},
		},
	),
);

useDataVisualizationStore.getState().loadChartsForCurrentFile();
