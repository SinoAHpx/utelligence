import { create } from "zustand";

interface OutliersMethodDetails {
    mean?: number;
    stdDev?: number;
    q1?: number;
    q3?: number;
    iqr?: number;
    lowerPercentile?: number;
    upperPercentile?: number;
}

interface OutliersStatistics {
    lowerBound: number;
    upperBound: number;
    method: string;
    threshold: number;
    outlierCount: number;
    totalCount: number;
    methodDetails: OutliersMethodDetails;
}

interface OutliersState {
    data: any[];
    columnName: string;
    method: string;
    threshold: number;
    statistics: OutliersStatistics;
    activeTab: string;
    isLoading: boolean;
    chartData: any[];

    // Actions
    setData: (data: any[]) => void;
    setColumnName: (name: string) => void;
    setMethod: (method: string) => void;
    setThreshold: (threshold: number) => void;
    setStatistics: (stats: OutliersStatistics) => void;
    setActiveTab: (tab: string) => void;
    setIsLoading: (loading: boolean) => void;
    updateChartData: () => void;
}

export const useOutliersStore = create<OutliersState>()((set, get) => ({
    data: [],
    columnName: "",
    method: "zscore",
    threshold: 3,
    statistics: {
        lowerBound: 0,
        upperBound: 0,
        method: "zscore",
        threshold: 3,
        outlierCount: 0,
        totalCount: 0,
        methodDetails: {}
    },
    activeTab: "chart",
    isLoading: false,
    chartData: [],

    // Actions
    setData: (data) => set({ data }),
    setColumnName: (name) => set({ columnName: name }),
    setMethod: (method) => set({ method }),
    setThreshold: (threshold) => set({ threshold }),
    setStatistics: (stats) => set({ statistics: stats }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setIsLoading: (loading) => set({ isLoading: loading }),

    updateChartData: () => {
        const { data, columnName, statistics } = get();

        if (!data || data.length === 0) {
            set({ chartData: [] });
            return;
        }

        const chartData = data.map((item, index) => {
            const value = Number(item[columnName]);
            const isOutlier = value < statistics.lowerBound || value > statistics.upperBound;

            return {
                index,
                value,
                isOutlier,
            };
        });

        set({ chartData });
    }
})); 