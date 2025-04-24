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

export interface TabComponentProps {
    file: File | null;
    selectedColumn: string;
    selectedColumns: string[];
    availableColumns: string[];
    setMessage: (message: string) => void;
    setProcessedFileUrl: (url: string | null) => void;
    setCleaned: (cleaned: boolean) => void;
    rawFileData: { headers: string[]; rows: any[] } | null;
}

export interface MissingValuesTabProps {
    file: File | null;
    columns: string[];
    onSettingsChange: (settings: {
        [key: string]: { strategy: string; value?: string | number }
    }) => void;
    rawData: { headers: string[]; rows: any[] } | null;
}

export interface OutliersTabProps {
    file: File | null;
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
    rawData: { headers: string[]; rows: any[] } | null;
}

export interface DuplicatesTabProps {
    file: File | null;
    columns: string[];
    onSettingsChange: (settings: {
        columnsToCheck: string[];
        strategy: string;
    }) => void;
    rawData: { headers: string[]; rows: any[] } | null;
}

export interface TransformTabProps extends TabComponentProps {
    // Add transformation specific properties
} 