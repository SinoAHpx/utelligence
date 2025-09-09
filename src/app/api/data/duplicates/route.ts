import { NextResponse } from "next/server";
import Papa from "papaparse";

// GET endpoint for retrieving duplicate data
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const data = searchParams.get("data");
	const columnsParam = searchParams.get("columns");

	if (!data || !columnsParam) {
		return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
	}

	try {
		// Parse JSON data and columns
		const parsedData = JSON.parse(data) as Record<string, string>[];
		const columns = JSON.parse(columnsParam) as string[];

		// Detect duplicates
		const { duplicateGroups, statistics } = findDuplicates(parsedData, columns);

		return NextResponse.json({
			duplicateGroups,
			statistics,
		});
	} catch (error) {
		console.error("Error fetching duplicates:", error);
		return NextResponse.json({ error: "Error processing duplicate data" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		// 检查Content-Type以确定请求类型
		const contentType = request.headers.get("Content-Type") || "";

		// 处理JSON请求（分析模式）
		if (contentType.includes("application/json")) {
			const { data, columns, analyzeOnly } = await request.json();

			if (!data || !columns) {
				return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
			}

			// 分析重复数据
			const { duplicateGroups, statistics } = findDuplicates(data, columns);

			return NextResponse.json({
				duplicateGroups,
				statistics,
			});
		}

		// 处理表单数据（文件处理模式）
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const columnsParam = formData.get("columns") as string;
		const operation = formData.get("operation") as string;
		const keepStrategy = (formData.get("keepStrategy") as string) || "first";

		if (!file || !columnsParam || !operation) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		// Parse the file
		const text = await file.text();
		const results = Papa.parse(text, {
			header: true,
			skipEmptyLines: true,
		});

		const data = results.data as Record<string, string>[];
		const headers = results.meta.fields || [];
		const columns = JSON.parse(columnsParam) as string[];

		// Validate columns
		for (const column of columns) {
			if (!headers.includes(column)) {
				return NextResponse.json({ error: `Column '${column}' not found` }, { status: 400 });
			}
		}

		// Find duplicates using the shared function
		const { duplicateIndices, duplicateGroups, statistics } = findDuplicates(data, columns);

		// Process based on operation
		let processedData = [...data];

		if (operation === "remove-duplicates") {
			// Remove duplicates based on the selected keep strategy
			const indicesToRemove = new Set<number>();

			// For each duplicate group, decide which rows to keep based on strategy
			duplicateGroups.forEach((group) => {
				if (group.indices.length <= 1) return;

				let indicesToKeep: number[] = [];

				if (keepStrategy === "first") {
					// Keep only the first occurrence
					indicesToKeep = [group.indices[0]];
				} else if (keepStrategy === "last") {
					// Keep only the last occurrence
					indicesToKeep = [group.indices[group.indices.length - 1]];
				} else if (keepStrategy === "min-nulls") {
					// Keep the row with minimum null values across all columns
					let minNulls = Number.MAX_SAFE_INTEGER;
					let minNullIndex = -1;

					group.indices.forEach((idx) => {
						const row = data[idx];
						const nullCount = Object.values(row).filter(
							(val) => val === null || val === undefined || val.trim() === ""
						).length;

						if (nullCount < minNulls) {
							minNulls = nullCount;
							minNullIndex = idx;
						}
					});

					if (minNullIndex !== -1) {
						indicesToKeep = [minNullIndex];
					}
				}

				// Add all indices not in the keep list to the remove set
				group.indices.forEach((idx) => {
					if (!indicesToKeep.includes(idx)) {
						indicesToRemove.add(idx);
					}
				});
			});

			// Filter out rows that should be removed
			processedData = data.filter((_, index) => !indicesToRemove.has(index));
		}

		// Convert back to CSV
		const csv = Papa.unparse(processedData);

		// If specified to return statistics, return JSON
		const returnFormat = formData.get("returnFormat") as string;
		if (returnFormat === "json") {
			return NextResponse.json({
				statistics,
				processedCount: processedData.length,
			});
		}

		// Default return CSV file
		return new NextResponse(csv, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="duplicates_cleaned_${file.name}"`,
			},
		});
	} catch (error) {
		console.error("Error processing duplicates:", error);
		return NextResponse.json({ error: "Error processing duplicates" }, { status: 500 });
	}
}

// Utility function to find duplicates in data
function findDuplicates(data: Record<string, string>[], columns: string[]) {
	const duplicateMap = new Map<string, number[]>();

	// Group rows by their values in the specified columns
	data.forEach((row, index) => {
		// Create a key from the specified columns' values
		const key = columns
			.map((col) => {
				const value = row[col];
				if (value === undefined || value === null) return "";
				return String(value).trim();
			})
			.join("|");

		if (duplicateMap.has(key)) {
			duplicateMap.get(key)!.push(index);
		} else {
			duplicateMap.set(key, [index]);
		}
	});

	// Extract only the groups with duplicates (more than one row with same values)
	const duplicateGroups = Array.from(duplicateMap.entries())
		.filter(([_, indices]) => indices.length > 1)
		.map(([key, indices]) => {
			// Extract the rows for the group
			const rows = indices.map((idx) => ({
				...data[idx],
				_index: idx,
			}));

			return {
				key,
				indices,
				rows,
				count: indices.length,
			};
		});

	// Flatten all indices with duplicates
	const duplicateIndices = duplicateGroups.flatMap((group) => group.indices);

	// Calculate statistics
	const totalRows = data.length;
	const uniqueRows = duplicateMap.size;
	const duplicateRows = totalRows - uniqueRows;
	const duplicateGroupsCount = duplicateMap.size - duplicateGroups.length;

	return {
		duplicateIndices,
		duplicateGroups,
		statistics: {
			totalRows,
			uniqueRows,
			duplicateRows,
			duplicateGroupsCount,
			duplicateCount: duplicateIndices.length,
		},
	};
}
