import { create } from "zustand";
import { processFile } from "@/utils/data/file-upload/upload-utils";

interface ParsedData {
    headers: string[];
    rows: string[][];
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
    /**
     * 解析并处理上传的文件，提取表头和数据内容。
     * - 避免对同一文件重复处理（通过文件名和大小唯一标识）。
     * - 处理过程中会设置 loading 状态和错误信息。
     * - 处理成功后，parsedData 会被更新用于预览和后续操作。
     * @param file 要处理的文件对象
     */
    processFile: (file: File) => Promise<void>;
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