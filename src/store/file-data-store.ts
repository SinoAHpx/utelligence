import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FileData } from "@/utils/data/data-processing";
import { processAndAnalyzeFileData } from "@/utils/data/visualization/data-visualization-helpers";
import { ColumnVisualizableConfig } from "./visualization-chart-store";

// Helper function to access visualization chart store to avoid circular dependencies
const getVisualizationChartStore = () => {
    // Dynamic import to avoid circular dependency
    const { visualizationChartStore } = require('./visualizationChartStore');
    return visualizationChartStore;
};

/**
 * File data state interface
 * Manages all state related to the file data loading and processing
 */
interface FileDataState {
    // Raw data from the uploaded file (non-persistent)
    rawFileData: { headers: string[]; rows: FileData } | null;
    setRawFileData: (data: { headers: string[]; rows: FileData } | null) => void;

    // Identifier for the currently active file (persistent)
    currentFileIdentifier: string | null;
    setCurrentFileIdentifier: (identifier: string | null) => void;

    // File processing state (non-persistent)
    isFileLoading: boolean;
    fileError: string | null;

    // Actions
    processAndAnalyzeFile: (
        file: File,
        columnsToAnalyze: string[],
    ) => Promise<void>;
}

/**
 * Zustand store for file data
 * Persists file identifier to localStorage for session continuity
 */
export const fileDataStore = create<FileDataState>()(
    persist(
        (set, get) => ({
            // --- State ---
            rawFileData: null,
            currentFileIdentifier: null,
            isFileLoading: false,
            fileError: null,

            // --- Setters ---
            setRawFileData: (data) => set({ rawFileData: data }),
            setCurrentFileIdentifier: (identifier) => {
                set({ currentFileIdentifier: identifier });
                // Update charts in visualization store when file changes
                setTimeout(() => {
                    getVisualizationChartStore().getState().loadChartsForCurrentFile();
                }, 0);
            },

            // --- File Processing Action ---
            processAndAnalyzeFile: async (file, columnsToAnalyze) => {
                const fileIdentifier = `${file.name}-${file.size}`;

                set({
                    isFileLoading: true,
                    fileError: null,
                    rawFileData: null,
                });

                try {
                    const { rawData, columnsVisualizableStatus } =
                        await processAndAnalyzeFileData(file, columnsToAnalyze);

                    set({
                        currentFileIdentifier: fileIdentifier,
                        rawFileData: rawData,
                        fileError: null,
                    });

                    // Update visualizable status in visualization store
                    setTimeout(() => {
                        getVisualizationChartStore()
                            .getState()
                            .setColumnsVisualizableStatus(columnsVisualizableStatus);

                        // Load charts for the file in visualization store
                        getVisualizationChartStore().getState().loadChartsForCurrentFile();
                    }, 0);
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
                    });

                    // Reset visualizable status in visualization store
                    setTimeout(() => {
                        getVisualizationChartStore()
                            .getState()
                            .setColumnsVisualizableStatus([]);
                    }, 0);
                } finally {
                    set({ isFileLoading: false });
                }
            },
        }),
        {
            name: "file-data-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentFileIdentifier: state.currentFileIdentifier,
            }),
            onRehydrateStorage: (state) => {
                console.log("Hydrating file data state...");
                return (state, error) => {
                    if (error) {
                        console.error("Failed to hydrate file data state:", error);
                    } else if (state) {
                        console.log(
                            "File data hydration success, current file:",
                            state.currentFileIdentifier,
                        );
                    }
                };
            },
        },
    ),
); 