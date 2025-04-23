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
    selectedColumns: string[];
    availableColumns: string[];
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

export interface MissingValuesTabProps extends TabComponentProps {
    missingOption: string;
    setMissingOption: (option: string) => void;
    customValue: string;
    setCustomValue: (value: string) => void;
}

export interface OutliersTabProps extends TabComponentProps {
    outlierOption: string;
    setOutlierOption: (option: string) => void;
    detectionMethod: string;
    setDetectionMethod: (method: string) => void;
    threshold: number;
    setThreshold: (threshold: number) => void;
    outlierStats: OutlierStats;
    setOutlierStats: (stats: OutlierStats) => void;
    showVisualization: boolean;
    setShowVisualization: (show: boolean) => void;
    outlierData: any[];
    setOutlierData: (data: any[]) => void;
}

export interface DuplicatesTabProps extends TabComponentProps {
    duplicateOption: string;
    setDuplicateOption: (option: string) => void;
    keepStrategy: string;
    setKeepStrategy: (strategy: string) => void;
    duplicateColumnsSelection: string[];
    setDuplicateColumnsSelection: (columns: string[]) => void;
    duplicateStats: DuplicateStats;
    setDuplicateStats: (stats: DuplicateStats) => void;
    duplicateGroups: any[];
    setDuplicateGroups: (groups: any[]) => void;
    showDuplicatesVisualization: boolean;
    setShowDuplicatesVisualization: (show: boolean) => void;
}

export interface TransformTabProps extends TabComponentProps {
    // Add transformation specific properties
} 