import { visualizationChartStore } from './visualizationChartStore';

// Re-export all stores for easy import in components
export { visualizationChartStore } from './visualizationChartStore';
export { fileDataStore } from './fileDataStore';
export { dataCleaningStore } from './dataCleaningStore';

// Re-export types
export type { ColumnVisualizableConfig } from './visualizationChartStore';

// Initialize stores
// This ensures that all stores are correctly initialized after hydration
// and any cross-store dependencies are set up properly
setTimeout(() => {
    // Load charts for the current file, if any
    visualizationChartStore.getState().loadChartsForCurrentFile();
}, 100); 