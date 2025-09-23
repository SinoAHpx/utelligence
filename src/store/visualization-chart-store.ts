import { CHART_TYPES, type ChartConfig, type ChartType } from "@/types/chart-types";
import type { ChartBuilderState, ColumnVisualizableConfig } from "@/types/visualization";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const buildDefaultBuilder = (): ChartBuilderState => ({
	chartType: "bar",
	title: "",
	xAxis: null,
	yAxis: null,
});

const requiresAxis = (type: ChartType): boolean =>
	CHART_TYPES.find((definition) => definition.id === type)?.requiresAxis ?? false;

const sanitizeBuilder = (
	builder: ChartBuilderState,
	columns: string[],
	status: ColumnVisualizableConfig[]
): ChartBuilderState => {
	const needsAxis = requiresAxis(builder.chartType);
	const normalizedColumns = new Set(columns);

	const sanitizeAxis = (axis: string | null) =>
		axis && normalizedColumns.has(axis) ? axis : null;

	const nextXAxis = needsAxis ? sanitizeAxis(builder.xAxis) : null;

	let nextYAxis = sanitizeAxis(builder.yAxis);
	if (needsAxis && nextYAxis && nextYAxis === nextXAxis) {
		nextYAxis = null;
	}

	if (nextYAxis) {
		const columnStatus = status.find((item) => item.column === nextYAxis);
		if (!columnStatus || (!columnStatus.isVisualizable && columnStatus.uniqueValues <= 0)) {
			nextYAxis = null;
		}
	}

	return {
		chartType: builder.chartType,
		title: builder.title,
		xAxis: nextXAxis,
		yAxis: nextYAxis,
	};
};

interface VisualizationChartState {
	currentFileIdentifier: string | null;
	availableColumns: string[];
	columnsVisualizableStatus: ColumnVisualizableConfig[];
	fileChartConfigs: Record<string, ChartConfig[]>;
	userCharts: ChartConfig[];
	builder: ChartBuilderState;

	setCurrentFileIdentifier: (identifier: string | null) => void;
	initializeFileContext: (payload: {
		identifier: string;
		columns: string[];
		columnStatus: ColumnVisualizableConfig[];
	}) => void;
	resetCurrentFile: () => void;

	setAvailableColumns: (columns: string[]) => void;
	setColumnsVisualizableStatus: (status: ColumnVisualizableConfig[]) => void;
	setChartType: (type: ChartType) => void;
	setChartTitle: (title: string) => void;
	setXAxisColumn: (column: string | null) => void;
	setYAxisColumn: (column: string | null) => void;
	resetBuilder: () => void;

	addChart: (chart: ChartConfig) => void;
	removeChart: (chartId: string) => void;
	clearChartsForFile: (fileIdentifier: string) => void;
}

export const visualizationChartStore = create<VisualizationChartState>()(
	persist(
		(set) => ({
			currentFileIdentifier: null,
			availableColumns: [],
			columnsVisualizableStatus: [],
			fileChartConfigs: {},
			userCharts: [],
			builder: buildDefaultBuilder(),

			setCurrentFileIdentifier: (identifier) => {
				set((state) => {
					if (!identifier) {
						return {
							currentFileIdentifier: null,
							userCharts: [],
							availableColumns: [],
							columnsVisualizableStatus: [],
							builder: buildDefaultBuilder(),
						};
					}

					const chartsForFile = state.fileChartConfigs[identifier] ?? [];
					return {
						currentFileIdentifier: identifier,
						userCharts: chartsForFile,
						builder: buildDefaultBuilder(),
					};
				});
			},

			initializeFileContext: ({ identifier, columns, columnStatus }) => {
				set((state) => {
					const chartsForFile = state.fileChartConfigs[identifier] ?? [];
					return {
						currentFileIdentifier: identifier,
						availableColumns: columns,
						columnsVisualizableStatus: columnStatus,
						userCharts: chartsForFile,
						builder: sanitizeBuilder(state.builder, columns, columnStatus),
					};
				});
			},

			resetCurrentFile: () => {
				set({
					currentFileIdentifier: null,
					availableColumns: [],
					columnsVisualizableStatus: [],
					userCharts: [],
					builder: buildDefaultBuilder(),
				});
			},

			setAvailableColumns: (columns) => {
				set((state) => ({
					availableColumns: columns,
					builder: sanitizeBuilder(state.builder, columns, state.columnsVisualizableStatus),
				}));
			},

			setColumnsVisualizableStatus: (status) => {
				set((state) => ({
					columnsVisualizableStatus: status,
					builder: sanitizeBuilder(state.builder, state.availableColumns, status),
				}));
			},

			setChartType: (type) => {
				set((state) => ({
					builder: {
						chartType: type,
						title: state.builder.title,
						xAxis: requiresAxis(type) ? null : state.builder.xAxis,
						yAxis: null,
					},
				}));
			},

			setChartTitle: (title) => {
				set((state) => ({
					builder: { ...state.builder, title },
				}));
			},

			setXAxisColumn: (column) => {
				set((state) => {
					const normalized = column && column.length > 0 ? column : null;
					return {
						builder: {
							...state.builder,
							xAxis: normalized,
							yAxis:
								normalized && state.builder.yAxis === normalized
									? null
									: state.builder.yAxis,
						},
					};
				});
			},

			setYAxisColumn: (column) => {
				set((state) => {
					const normalized = column && column.length > 0 ? column : null;
					return {
						builder: {
							...state.builder,
							yAxis:
								normalized && state.builder.xAxis === normalized
									? null
									: normalized,
						},
					};
				});
			},

			resetBuilder: () => {
				set({ builder: buildDefaultBuilder() });
			},

			addChart: (chart) => {
				set((state) => {
					const currentId = state.currentFileIdentifier;
					if (!currentId) {
						console.warn("Attempted to add a chart without an active file context.");
						return state;
					}

					const existingCharts = state.fileChartConfigs[currentId] ?? [];
					const updatedCharts = [...existingCharts, chart];

					return {
						fileChartConfigs: {
							...state.fileChartConfigs,
							[currentId]: updatedCharts,
						},
						userCharts: updatedCharts,
					};
				});
			},

			removeChart: (chartId) => {
				set((state) => {
					const currentId = state.currentFileIdentifier;
					if (!currentId) {
						return state;
					}

					const existingCharts = state.fileChartConfigs[currentId] ?? [];
					const updatedCharts = existingCharts.filter((chart) => chart.id !== chartId);

					return {
						fileChartConfigs: {
							...state.fileChartConfigs,
							[currentId]: updatedCharts,
						},
						userCharts: updatedCharts,
					};
				});
			},

			clearChartsForFile: (fileIdentifier) => {
				set((state) => {
					const nextConfigs = { ...state.fileChartConfigs };
					delete nextConfigs[fileIdentifier];

					return {
						fileChartConfigs: nextConfigs,
						userCharts:
							state.currentFileIdentifier === fileIdentifier ? [] : state.userCharts,
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
						console.log("Visualization chart store hydrated");
					}
				};
			},
		}
	)
);
