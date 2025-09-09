/**
 * Unified Type Definitions
 * Central location for all TypeScript type definitions
 */

// ============= Data Types =============

export interface FileData {
	[key: string]: any;
}

export interface ParsedData {
	headers: string[];
	rows: string[][];
}

export interface ProcessedData {
	headers: string[];
	rows: FileData;
}

export interface CleanedData {
	headers: string[];
	rows: any[];
}

// ============= Analysis Types =============

export interface DuplicateGroup {
	key: string;
	indices: number[];
	rows: any[];
	count: number;
}

export interface DuplicatesStatistics {
	totalRows: number;
	uniqueRows: number;
	duplicateRows: number;
	duplicateGroupsCount: number;
	duplicateCount: number;
}

export interface OutliersMethodDetails {
	mean?: number;
	stdDev?: number;
	q1?: number;
	q3?: number;
	iqr?: number;
	lowerPercentile?: number;
	upperPercentile?: number;
}

export interface OutliersStatistics {
	lowerBound: number;
	upperBound: number;
	method: string;
	threshold: number;
	outlierCount: number;
	totalCount: number;
	methodDetails: OutliersMethodDetails;
}

// ============= Chart Types =============

export interface ChartConfig {
	id: string;
	type: "bar" | "line" | "pie" | "scatter" | "area" | "radar";
	title: string;
	columns: string[];
	xAxis?: string;
	yAxis?: string;
	options?: ChartOptions;
}

export interface ChartOptions {
	showLegend?: boolean;
	showGrid?: boolean;
	showTooltip?: boolean;
	colors?: string[];
	width?: number;
	height?: number;
	[key: string]: any;
}

export interface ColumnVisualizableConfig {
	column: string;
	isVisualizable: boolean;
	uniqueValues: number;
	totalValues: number;
	reason?: string;
}

// ============= Statistics Types =============

export interface BasicStatistics {
	count: number;
	mean: number;
	median: number;
	mode: number | number[];
	min: number;
	max: number;
	sum: number;
}

export interface DispersionStatistics {
	variance: number;
	standardDeviation: number;
	coefficientOfVariation: number;
	range: number;
	interquartileRange: number;
	meanAbsoluteDeviation: number;
}

export interface DistributionStatistics {
	skewness: number;
	kurtosis: number;
	percentiles: {
		p25: number;
		p50: number;
		p75: number;
		p90: number;
		p95: number;
		p99: number;
	};
}

// ============= Chat Types =============

export interface ChatOptions {
	selectedModel: string;
	systemPrompt: string;
	temperature: number;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp?: number;
	metadata?: any;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: number;
	updatedAt: number;
}

// ============= API Types =============

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface FileUploadResponse {
	headers: string[];
	rows: any[];
	fileId: string;
}

export interface DataAnalysisRequest {
	data: any[];
	columns: string[];
	operation: string;
	options?: any;
}

export interface DataAnalysisResponse {
	result: any;
	statistics?: any;
	metadata?: any;
}

// ============= UI Types =============

export interface TabConfig {
	id: string;
	label: string;
	icon?: React.ComponentType;
	disabled?: boolean;
}

export interface TableColumn {
	key: string;
	label: string;
	sortable?: boolean;
	width?: string | number;
	align?: "left" | "center" | "right";
}

export interface FilterConfig {
	column: string;
	operator: "equals" | "contains" | "greater" | "less" | "between";
	value: any;
}

// ============= Utility Types =============

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type Callback<T = void> = (data: T) => void;

// Re-export from other type files
export type { ChartConfig as ChartConfiguration } from "./chart-types";
