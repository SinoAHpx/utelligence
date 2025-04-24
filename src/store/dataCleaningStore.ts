import { create } from "zustand";
import { fileDataStore } from "./fileDataStore";

/**
 * Data cleaning state interface
 * Manages all state related to data cleaning operations
 */
interface DataCleaningState {
    // Cleaned data after processing (non-persistent)
    cleanedData: { headers: string[]; rows: any[] } | null;
    setCleanedData: (data: { headers: string[]; rows: any[] } | null) => void;
    updateCleanedData: (data: { headers: string[]; rows: any[] }) => void;

    // Data cleaning operations handler
    handleOperation: (
        operationType: string,
        params: any
    ) => Promise<{ headers: string[]; rows: any[] } | null>;
}

/**
 * Zustand store for data cleaning
 * Manages the data cleaning operations and cleaned data state
 */
export const dataCleaningStore = create<DataCleaningState>()((set, get) => ({
    // --- State ---
    cleanedData: null,

    // --- Setters ---
    setCleanedData: (data) => set({ cleanedData: data }),
    updateCleanedData: (data) => set({ cleanedData: data }),

    // --- Data Cleaning Operations Handler ---
    handleOperation: async (operationType, params) => {
        try {
            const { data, column, ...options } = params;
            let result = { ...data };

            // If no cleaned data exists yet and we have raw data, initialize from raw data
            if (!get().cleanedData && fileDataStore.getState().rawFileData) {
                const rawData = fileDataStore.getState().rawFileData;
                if (rawData) {
                    const initialCleanedData = {
                        headers: rawData.headers,
                        rows: [...rawData.rows],
                    };
                    set({ cleanedData: initialCleanedData });
                    result = initialCleanedData;
                }
            }

            // Process different operation types
            switch (operationType) {
                case "missing":
                    // Handle missing values processing
                    // Implementation will depend on your specific requirements
                    console.log(`Processing missing values for column ${column}`);
                    break;

                case "outliers":
                    // Handle outliers processing
                    console.log(`Processing outliers for column ${column}`);
                    break;

                case "duplicates":
                    // Handle duplicates processing
                    console.log(`Processing duplicates for columns ${params.columnsToCheck}`);
                    break;

                default:
                    console.warn(`Unknown operation type: ${operationType}`);
                    return null;
            }

            // Update the cleaned data state
            set({ cleanedData: result });
            return result;
        } catch (error) {
            console.error(`Error during ${operationType} operation:`, error);
            return null;
        }
    },
})); 