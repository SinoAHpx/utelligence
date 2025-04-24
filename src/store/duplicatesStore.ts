import { create } from "zustand";

interface DuplicateGroup {
    key: string;
    indices: number[];
    rows: any[];
    count: number;
}

interface DuplicatesStatistics {
    totalRows: number;
    uniqueRows: number;
    duplicateRows: number;
    duplicateGroupsCount: number;
    duplicateCount: number;
}

interface DuplicatesState {
    data: any[];
    selectedColumns: string[];
    duplicateGroups: DuplicateGroup[];
    statistics: DuplicatesStatistics;
    activeTab: string;
    expandedGroup: string | null;

    // Actions
    setData: (data: any[]) => void;
    setSelectedColumns: (columns: string[]) => void;
    setDuplicateGroups: (groups: DuplicateGroup[]) => void;
    setStatistics: (stats: DuplicatesStatistics) => void;
    setActiveTab: (tab: string) => void;
    setExpandedGroup: (groupId: string | null) => void;
}

export const useDuplicatesStore = create<DuplicatesState>()((set) => ({
    data: [],
    selectedColumns: [],
    duplicateGroups: [],
    statistics: {
        totalRows: 0,
        uniqueRows: 0,
        duplicateRows: 0,
        duplicateGroupsCount: 0,
        duplicateCount: 0
    },
    activeTab: "summary",
    expandedGroup: null,

    // Actions
    setData: (data) => set({ data }),
    setSelectedColumns: (columns) => set({ selectedColumns: columns }),
    setDuplicateGroups: (groups) => set({ duplicateGroups: groups }),
    setStatistics: (stats) => set({ statistics: stats }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setExpandedGroup: (groupId) => set({ expandedGroup: groupId }),
})); 