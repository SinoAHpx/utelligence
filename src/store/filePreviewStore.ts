import { create } from "zustand";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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
    maxRows: 20,

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

    processFile: async (file, maxRows = 20) => {
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

        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        try {
            if (fileExtension === "csv") {
                // 处理CSV文件
                const text = await file.text();
                Papa.parse(text, {
                    complete: (results) => {
                        const headers = results.data[0] as string[];
                        const data = results.data.slice(1, maxRows + 1) as string[][];
                        set({
                            parsedData: { headers, data },
                            isLoading: false
                        });
                    },
                    error: (error: { message: any; }) => {
                        set({
                            error: `解析CSV文件失败: ${error.message}`,
                            isLoading: false
                        });
                    },
                });
            } else if (fileExtension === "xlsx" || fileExtension === "xls") {
                // 处理Excel文件
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // 转换为JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 提取表头和数据
                const headers = jsonData[0] as string[];
                const data = jsonData.slice(1, maxRows + 1) as string[][];

                set({
                    parsedData: { headers, data },
                    isLoading: false
                });
            } else {
                set({
                    error: "不支持的文件类型",
                    isLoading: false
                });
            }
        } catch (err) {
            set({
                error: `文件解析错误: ${err instanceof Error ? err.message : String(err)}`,
                isLoading: false
            });
        }
    }
})); 