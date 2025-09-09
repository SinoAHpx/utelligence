/**
 * Compatibility Layer for Store Migration
 * This file provides backwards compatibility for components still using old stores
 * Will be removed after full migration to unified-data-store
 */

import { useUnifiedDataStore } from "./unified-data-store";
import { visualizationChartStore } from "./visualization-chart-store";

// File Upload Store Compatibility
export const useFileUploadStore = () => {
	const store = useUnifiedDataStore();

	return {
		file: store.currentFile,
		parsedData: store.rawData,
		isLoading: store.isLoading,
		error: store.error,
		processedFileRef: store.currentFileIdentifier,

		setFile: (file: File | null) => {
			if (file) {
				store.uploadFile(file);
			} else {
				store.clearFile();
			}
		},
		setParsedData: (data: any) => {
			// This is now handled internally by uploadFile
			console.warn("setParsedData is deprecated, data is managed internally");
		},
		setIsLoading: (loading: boolean) => {
			// This is now handled internally
			console.warn("setIsLoading is deprecated, loading state is managed internally");
		},
		setError: (error: string | null) => {
			// This is now handled internally
			console.warn("setError is deprecated, error state is managed internally");
		},
		processFile: store.uploadFile,
	};
};

// File Data Store Compatibility
export const fileDataStore = {
	getState: () => {
		const state = useUnifiedDataStore.getState();
		return {
			rawFileData: state.processedData,
			currentFileIdentifier: state.currentFileIdentifier,
			isFileLoading: state.isLoading,
			fileError: state.error,

			setRawFileData: (data: any) => {
				console.warn("setRawFileData is deprecated, use unified store");
			},
			setCurrentFileIdentifier: (identifier: string | null) => {
				// Update visualization store as well
				visualizationChartStore.getState().setCurrentFileIdentifier(identifier);
			},
			processAndAnalyzeFile: state.processAndAnalyze,
		};
	},
	setState: (updater: any) => {
		console.warn("Direct setState on fileDataStore is deprecated");
	},
};

// Data Cleaning Store Compatibility
export const dataCleaningStore = {
	getState: () => {
		const state = useUnifiedDataStore.getState();
		return {
			cleanedData: state.cleanedData,
			setCleanedData: (data: any) => {
				console.warn("setCleanedData is deprecated, use unified store");
			},
			updateCleanedData: (data: any) => {
				console.warn("updateCleanedData is deprecated, use unified store");
			},
			handleOperation: state.cleanData,
		};
	},
};

// Duplicates Store Compatibility
export const useDuplicatesStore = () => {
	const store = useUnifiedDataStore();
	const state = store.duplicates;

	return {
		data: store.cleanedData?.rows || store.processedData?.rows || [],
		selectedColumns: state.selectedColumns,
		duplicateGroups: state.groups,
		statistics: state.statistics,
		activeTab: state.activeTab,
		expandedGroup: state.expandedGroup,

		setData: (data: any[]) => {
			console.warn("setData is deprecated, data is managed by unified store");
		},
		setSelectedColumns: store.setDuplicatesColumns,
		setDuplicateGroups: (groups: any[]) => {
			console.warn("setDuplicateGroups is deprecated, use analyzeDuplicates");
		},
		setStatistics: (stats: any) => {
			console.warn("setStatistics is deprecated, statistics are computed automatically");
		},
		setActiveTab: (tab: string) => store.setActiveTab("duplicates", tab),
		setExpandedGroup: store.setExpandedGroup,
	};
};

// Outliers Store Compatibility
export const useOutliersStore = () => {
	const store = useUnifiedDataStore();
	const state = store.outliers;

	return {
		data: store.cleanedData?.rows || store.processedData?.rows || [],
		columnName: state.columnName,
		method: state.method,
		threshold: state.threshold,
		statistics: state.statistics,
		activeTab: state.activeTab,
		isLoading: store.isLoading,
		chartData: state.chartData,

		setData: (data: any[]) => {
			console.warn("setData is deprecated, data is managed by unified store");
		},
		setColumnName: store.setOutliersColumn,
		setMethod: (method: string) => store.setOutliersMethod(method, state.threshold),
		setThreshold: (threshold: number) => store.setOutliersMethod(state.method, threshold),
		setStatistics: (stats: any) => {
			console.warn("setStatistics is deprecated, statistics are computed automatically");
		},
		setActiveTab: (tab: string) => store.setActiveTab("outliers", tab),
		setIsLoading: (loading: boolean) => {
			console.warn("setIsLoading is deprecated, loading state is managed internally");
		},
		updateChartData: () => {
			console.warn("updateChartData is deprecated, chart data is updated automatically");
		},
	};
};
