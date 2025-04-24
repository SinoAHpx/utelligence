import { create } from "zustand";
import { processFile } from "@/utils/data/file-upload/upload-utils";

interface ParsedData {
    headers: string[];
    data: string[][];
}

interface FilePreviewState {
    file: File | null;
    parsedData: ParsedData | null;
    isLoading: boolean;
    error: string | null;
    selectedColumns: string[];
    processedFileRef: string;
    maxRows: number;

    // Actions
    setFile: (file: File | null) => void;
    setParsedData: (data: ParsedData | null) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedColumns: (columns: string[]) => void;
    toggleColumnSelection: (column: string) => void;
    processFile: (file: File, maxRows?: number) => Promise<void>;
    clearSelectedColumns: () => void;
}

export const useFilePreviewStore = create<FilePreviewState>()((set, get) => ({
    file: null,
    parsedData: null,
    isLoading: false,
    error: null,
    selectedColumns: [],
    processedFileRef: "",
    maxRows: 30,

    // Actions
    setFile: (file) => set({ file }),
    setParsedData: (data) => set({ parsedData: data }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setSelectedColumns: (columns) => set({ selectedColumns: columns }),
    clearSelectedColumns: () => set({ selectedColumns: [] }),

    toggleColumnSelection: (column) => {
        set((state) => {
            if (state.selectedColumns.includes(column)) {
                return {
                    selectedColumns: state.selectedColumns.filter((col) => col !== column)
                };
            } else {
                return {
                    selectedColumns: [...state.selectedColumns, column]
                };
            }
        });
    },

    processFile: async (file, maxRows = 30) => {
        const fileKey = `${file.name}-${file.size}`;
        const { processedFileRef } = get();

        // 检查是否已处理过该文件
        if (fileKey === processedFileRef) {
            return; // 如果是同一个文件，不重复处理
        }

        set({
            isLoading: true,
            error: null,
            file,
            processedFileRef: fileKey
        });

        try {
            const result = await processFile(file, maxRows);
            set({
                parsedData: result,
                isLoading: false
            });
        } catch (err) {
            set({
                error: `文件解析错误: ${err instanceof Error ? err.message : String(err)}`,
                isLoading: false
            });
        }
    }
})); 