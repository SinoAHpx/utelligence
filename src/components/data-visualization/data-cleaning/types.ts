export interface OutlierStats {
    count: number;
    lowerBound: number;
    upperBound: number;
    method: string;
    threshold: number;
    hasRun: boolean;
}

export interface DuplicateStats {
    totalRows: number;
    uniqueRows: number;
    duplicateRows: number;
    duplicateGroupsCount: number;
    duplicateCount: number;
    hasRun: boolean;
}

export interface DataCleaningProps {
    file: File | null;
    availableColumns: string[];
    onColumnsChange: (columns: string[]) => void;
}

export interface TabBaseProps {
    file: File | null;
    availableColumns: string[];
    rawData: { headers: string[]; rows: any[] } | null;
    onComplete: () => void;
    onProgress: (value: number) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
    onError: (error: string) => void;
}

export interface TabComponentProps extends TabBaseProps {
    selectedColumn: string;
    selectedColumns: string[];
    setMessage: (message: string) => void;
    setProcessedFileUrl: (url: string | null) => void;
    setCleaned: (cleaned: boolean) => void;
    rawFileData: { headers: string[]; rows: any[] } | null;
}

export interface MissingValuesTabProps extends TabBaseProps {
    columns: string[];
    onSettingsChange: (settings: {
        [key: string]: { strategy: string; value?: string | number }
    }) => void;
}

export interface OutliersTabProps extends TabBaseProps {
    columns: string[];
    onSettingsChange: (settings: {
        [key: string]: {
            method: string;
            action: string;
            lowerThreshold?: number;
            upperThreshold?: number;
            multiplier?: number;
            replacementMethod?: string;
            replacementValue?: number;
        }
    }) => void;
}

export interface DuplicatesTabProps extends TabBaseProps {
    columns: string[];
    onSettingsChange: (settings: {
        columnsToCheck: string[];
        strategy: string;
    }) => void;
}

export interface TransformTabProps extends TabComponentProps {
    // Add transformation specific properties
} 