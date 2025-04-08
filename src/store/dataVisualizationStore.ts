import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChartConfig, ChartDataItem } from "@/types/chart-types";

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
	// Chart data
	chartData: ChartDataItem[];
	setChartData: (data: ChartDataItem[]) => void;

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

	yAxisColumn: string;
	setYAxisColumn: (column: string) => void;

	// Processed file info
	processedFile: { name: string; size: number } | null;
	setProcessedFile: (file: { name: string; size: number } | null) => void;

	// Column visualization status
	columnsVisualizableStatus: ColumnVisualizableConfig[];
	setColumnsVisualizableStatus: (status: ColumnVisualizableConfig[]) => void;
}

/**
 * Zustand store for data visualization
 * Persists data to localStorage for session continuity
 */
export const useDataVisualizationStore = create<DataVisualizationState>()(
	persist(
		(set) => ({
			// Chart data
			chartData: [],
			setChartData: (data) => set({ chartData: data }),

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

			yAxisColumn: "",
			setYAxisColumn: (column) => set({ yAxisColumn: column }),

			// Processed file info
			processedFile: null,
			setProcessedFile: (file) => set({ processedFile: file }),

			// Column visualization status
			columnsVisualizableStatus: [],
			setColumnsVisualizableStatus: (status) =>
				set({ columnsVisualizableStatus: status }),
		}),
		{
			name: "data-visualization-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
