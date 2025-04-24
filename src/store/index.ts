import { visualizationChartStore } from './visualization-chart-store';

// Re-export all stores for easy import in components
export { visualizationChartStore } from './visualization-chart-store';
export { fileDataStore } from './file-data-store';
export { dataCleaningStore } from './data-cleaning-store';

// Re-export types
export type { ColumnVisualizableConfig } from './visualization-chart-store';

// Initialize stores
// This ensures that all stores are correctly initialized after hydration
// and any cross-store dependencies are set up properly
setTimeout(() => {
    // Load charts for the current file, if any
    visualizationChartStore.getState().loadChartsForCurrentFile();
}, 100); 