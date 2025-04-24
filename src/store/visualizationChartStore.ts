import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChartConfig } from "@/types/chart-types";

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
    loadChartsForCurrentFile: () => void;
}

// Function to get the current file identifier from fileDataStore
// This breaks the circular dependency
const getCurrentFileIdentifier = () => {
    // Dynamic import to avoid circular dependency
    const { fileDataStore } = require('./fileDataStore');
    return fileDataStore.getState().currentFileIdentifier;
};

/**
 * Zustand store for visualization chart data
 * Persists chart configurations to localStorage for session continuity
 */
export const visualizationChartStore = create<VisualizationChartState>()(
    persist(
        (set, get) => ({
            // --- State ---
            fileChartConfigs: {},
            userCharts: [],
            columnsVisualizableStatus: [],
            selectedChartType: "bar",
            selectedColumnsForChart: [],
            chartTitle: "",
            xAxisColumn: "",
            yAxisColumn: "",

            // --- Setters ---
            setColumnsVisualizableStatus: (status) =>
                set({ columnsVisualizableStatus: status }),
            setSelectedChartType: (type) => set({ selectedChartType: type }),
            setSelectedColumnsForChart: (columns) =>
                set({ selectedColumnsForChart: columns }),
            setChartTitle: (title) => set({ chartTitle: title }),
            setXAxisColumn: (column) => set({ xAxisColumn: column }),
            setYAxisColumn: (column) => set({ yAxisColumn: column }),

            // --- Actions operating on the CURRENT file's charts ---
            addChart: (chart) => {
                const currentId = getCurrentFileIdentifier();
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
                const currentId = getCurrentFileIdentifier();
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
                const currentId = getCurrentFileIdentifier();
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
                const currentId = getCurrentFileIdentifier();
                const fileConfigs = get().fileChartConfigs;
                if (currentId && fileConfigs[currentId]) {
                    set({ userCharts: fileConfigs[currentId] });
                } else {
                    set({ userCharts: [] });
                }
            },
        }),
        {
            name: "visualization-chart-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                fileChartConfigs: state.fileChartConfigs,
            }),
            onRehydrateStorage: (state) => {
                console.log("Hydrating visualization chart state...");
                return (rehydratedState, error) => {
                    if (error) {
                        console.error("Failed to hydrate visualization chart state:", error);
                    } else if (rehydratedState) {
                        console.log("Visualization chart hydration success");
                        // We can't call loadChartsForCurrentFile here directly
                        // because fileDataStore might not be initialized yet
                        setTimeout(() => {
                            visualizationChartStore.getState().loadChartsForCurrentFile();
                        }, 0);
                    }
                };
            },
        },
    ),
);

// We'll initialize charts after both stores are initialized
// This is moved to the index file that will re-export all stores 