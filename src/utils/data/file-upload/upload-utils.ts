import Papa from "papaparse";

interface ProcessedFileData {
    headers: string[];
    data: string[][];
}

interface ParseError {
    message: string;
}

/**
 * Process uploaded CSV or Excel files and extract headers and data
 * @param file The uploaded file to process
 * @param maxRows Maximum number of data rows to extract
 * @returns Processed data with headers and rows
 */
export async function processFile(file: File, maxRows: number): Promise<ProcessedFileData> {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    try {
        if (fileExtension === "csv") {
            return await processCsvFile(file, maxRows);
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
            return await processExcelFile(file, maxRows);
        } else {
            throw new Error("Unsupported file type");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`File processing failed: ${errorMessage}`);
    }
}

/**
 * Process CSV file using PapaParse
 */
async function processCsvFile(file: File, maxRows: number): Promise<ProcessedFileData> {
    const text = await file.text();

    return new Promise<ProcessedFileData>((resolve, reject) => {
        Papa.parse(text, {
            complete: (results: { data: string[][] }) => {
                const headers = results.data[0];
                const data = results.data.slice(1, maxRows + 1);
                resolve({ headers, data });
            },
            error: (error: ParseError) => {
                reject(new Error(`CSV parsing failed: ${error.message}`));
            }
        });
    });
}

/**
 * Process Excel file using xlsx library
 */
async function processExcelFile(file: File, maxRows: number): Promise<ProcessedFileData> {
    const arrayBuffer = await file.arrayBuffer();
    const XLSX = await import("xlsx");

    const workbook = XLSX.read(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    const headers = jsonData[0];
    const data = jsonData.slice(1, maxRows + 1) || [];

    return { headers, data };
}