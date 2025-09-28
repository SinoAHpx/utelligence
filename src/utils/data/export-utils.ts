/**
 * Data export utilities for cleaned data
 */

export interface ExportData {
	headers: string[];
	rows: any[][];
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: ExportData): string {
	const { headers, rows } = data;

	// Escape and quote CSV values
	const escapeCSVValue = (value: any): string => {
		const str = String(value ?? "");
		// If value contains comma, quote, or newline, wrap in quotes and escape quotes
		if (str.includes(",") || str.includes('"') || str.includes("\n")) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	// Create CSV content
	const csvLines: string[] = [];

	// Add headers
	csvLines.push(headers.map(escapeCSVValue).join(","));

	// Add data rows
	rows.forEach(row => {
		csvLines.push(row.map(escapeCSVValue).join(","));
	});

	return csvLines.join("\n");
}

/**
 * Download data as CSV file
 */
export function downloadAsCSV(data: ExportData, filename: string = "cleaned_data.csv"): void {
	try {
		console.log("开始下载CSV文件:", filename);
		console.log("数据预览:", {
			headers: data.headers,
			rowCount: data.rows.length,
			firstRow: data.rows[0]
		});

		const csvContent = convertToCSV(data);
		console.log("CSV内容长度:", csvContent.length);

		// Add BOM for better Excel compatibility
		const BOM = "\uFEFF";
		const csvWithBOM = BOM + csvContent;

		const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
		console.log("Blob创建成功, 大小:", blob.size);

		// Check if we're in a browser environment
		if (typeof window === "undefined" || typeof document === "undefined") {
			throw new Error("Download function can only be used in browser environment");
		}

		// Create download link
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		console.log("URL创建成功:", url);

		link.href = url;
		link.download = filename;
		link.style.display = "none";

		console.log("准备添加链接到DOM...");
		// Append to body, click, and remove
		document.body.appendChild(link);

		// Use setTimeout to ensure the element is in the DOM
		setTimeout(() => {
			console.log("触发下载点击...");
			link.click();

			// Clean up after a short delay
			setTimeout(() => {
				console.log("清理下载链接...");
				if (document.body.contains(link)) {
					document.body.removeChild(link);
				}
				URL.revokeObjectURL(url);
				console.log("下载流程完成");
			}, 100);
		}, 0);

	} catch (error) {
		console.error("Error downloading CSV:", error);
		throw new Error(`Failed to download CSV file: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(originalFilename?: string, operation: string = "cleaned"): string {
	const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");

	if (originalFilename) {
		// Remove extension from original filename
		const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "");
		return `${nameWithoutExt}_${operation}_${timestamp}.csv`;
	}

	return `data_${operation}_${timestamp}.csv`;
}

/**
 * Get data statistics for export summary
 */
export function getDataStatistics(originalData: ExportData, cleanedData: ExportData) {
	const originalRows = originalData.rows.length;
	const cleanedRows = cleanedData.rows.length;
	const removedRows = originalRows - cleanedRows;
	const removalPercentage = originalRows > 0 ? (removedRows / originalRows) * 100 : 0;

	return {
		originalRows,
		cleanedRows,
		removedRows,
		removalPercentage: Math.round(removalPercentage * 100) / 100,
		columns: cleanedData.headers.length
	};
}