import { create } from "zustand";
import { processFile } from "@/utils/data/file-upload/upload-utils";

interface ParsedData {
    headers: string[];
    data: string[][];
}

interface FileUploadState {
    file: File | null;
    /**
     * Stores the parsed data from the uploaded file.
     * - headers: Array of column names from the file's first row.
     * - data: 2D array of string values representing the file's data rows.
     * Used for previewing and referencing file content in the UI.
     */
    parsedData: ParsedData | null;
    isLoading: boolean;
    error: string | null;
    processedFileRef: string;

    // Actions
    setFile: (file: File | null) => void;
    setParsedData: (data: ParsedData | null) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    processFile: (file: File, maxRows?: number) => Promise<void>;
}

export const useFileUploadStore = create<FileUploadState>()((set, get) => ({
    file: null,
    parsedData: null,
    isLoading: false,
    error: null,
    processedFileRef: "",

    // Actions
    setFile: (file) => set({ file }),
    setParsedData: (data) => set({ parsedData: data }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    processFile: async (file) => {
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
            const result = await processFile(file);
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