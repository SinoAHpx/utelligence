import type { ChartConfig } from "@/types/chart-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
 * Visualization chart state interface
 * Manages all state related to chart visualization features
 */
interface VisualizationChartState {
	// Current file identifier (managed internally)
	currentFileIdentifier: string | null;
	setCurrentFileIdentifier: (identifier: string | null) => void;

	// Chart configurations per file identifier (persistent)
	fileChartConfigs: Record<string, ChartConfig[]>;

	// Active charts for the current file (derived, non-persistent)
	userCharts: ChartConfig[];

	// Actions for active charts
	addChart: (chart: ChartConfig) => void;
	removeChart: (chartId: string) => void;
	clearCurrentFileCharts: () => void;

	// Chart creation state
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

	// Column visualization status
	columnsVisualizableStatus: ColumnVisualizableConfig[];
	setColumnsVisualizableStatus: (status: ColumnVisualizableConfig[]) => void;

	// Helper to load charts for the current file
	loadChartsForFile: (fileIdentifier: string) => void;
	clearChartsForFile: (fileIdentifier: string) => void;
}

/**
 * Zustand store for visualization chart data
 * Persists chart configurations to localStorage for session continuity
 */
export const visualizationChartStore = create<VisualizationChartState>()(
	persist(
		(set, get) => ({
			// --- State ---
			currentFileIdentifier: null,
			fileChartConfigs: {},
			userCharts: [],
			columnsVisualizableStatus: [],
			selectedChartType: "bar",
			selectedColumnsForChart: [],
			chartTitle: "",
			xAxisColumn: "",
			yAxisColumn: "",

			// --- Setters ---
			setCurrentFileIdentifier: (identifier) => {
				set({ currentFileIdentifier: identifier });
				// Load charts for this file when identifier changes
				if (identifier) {
					get().loadChartsForFile(identifier);
				} else {
					set({ userCharts: [] });
				}
			},
			setColumnsVisualizableStatus: (status) => set({ columnsVisualizableStatus: status }),
			setSelectedChartType: (type) => set({ selectedChartType: type }),
			setSelectedColumnsForChart: (columns) => set({ selectedColumnsForChart: columns }),
			setChartTitle: (title) => set({ chartTitle: title }),
			setXAxisColumn: (column) => set({ xAxisColumn: column }),
			setYAxisColumn: (column) => set({ yAxisColumn: column }),

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
					const updatedConfigs = currentConfigs.filter((chart) => chart.id !== chartId);
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

			// --- Helper methods for file management ---
			loadChartsForFile: (fileIdentifier) => {
				const fileConfigs = get().fileChartConfigs;
				if (fileIdentifier && fileConfigs[fileIdentifier]) {
					set({
						userCharts: fileConfigs[fileIdentifier],
						currentFileIdentifier: fileIdentifier,
					});
				} else {
					set({
						userCharts: [],
						currentFileIdentifier: fileIdentifier,
					});
				}
			},

			clearChartsForFile: (fileIdentifier) => {
				set((state) => {
					const newConfigs = { ...state.fileChartConfigs };
					delete newConfigs[fileIdentifier];
					return {
						fileChartConfigs: newConfigs,
						userCharts: state.currentFileIdentifier === fileIdentifier ? [] : state.userCharts,
					};
				});
			},
		}),
		{
			name: "visualization-chart-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				fileChartConfigs: state.fileChartConfigs,
				currentFileIdentifier: state.currentFileIdentifier,
			}),
			onRehydrateStorage: () => {
				return (rehydratedState, error) => {
					if (!error && rehydratedState) {
						// Charts will be loaded when currentFileIdentifier is set
						console.log("Visualization chart store hydrated");
					}
				};
			},
		}
	)
);
