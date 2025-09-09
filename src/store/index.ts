// Export unified store
export { useUnifiedDataStore } from "./unified-data-store";

// Export visualization store
export { visualizationChartStore } from "./visualization-chart-store";

// Export chat store
export { useChatStore } from "./chat-store";

// Re-export types
export type { ColumnVisualizableConfig } from "./visualization-chart-store";

// Export compatibility layer for backwards compatibility
// These exports will be removed after full migration
export {
	useFileUploadStore,
	fileDataStore,
	dataCleaningStore,
	useDuplicatesStore,
	useOutliersStore,
} from "./compatibility-layer";

// Note: Old stores (file-data-store, data-cleaning-store, file-upload-store,
// duplicates-store, outlier-store) are deprecated and should be migrated to
// unified-data-store
