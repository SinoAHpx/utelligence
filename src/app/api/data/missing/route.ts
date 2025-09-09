import { mean, median, mode } from "@/utils/data/statistics";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const columnName = formData.get("columnName") as string;
		const operation = formData.get("operation") as string;
		const customValue = formData.get("customValue") as string;

		if (!file || !columnName || !operation) {
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

		if (!headers.includes(columnName)) {
			return NextResponse.json({ error: `Column '${columnName}' not found` }, { status: 400 });
		}

		// Process the data based on the operation
		let processedData = data;
		const invalidValues = ["n/a", "na", "null", "undefined", "-", "", "nan", "#n/a"];

		if (operation === "remove-rows") {
			// Filter out rows with missing values in the specified column
			processedData = data.filter((row) => {
				const value = row[columnName];
				return !(
					value === undefined ||
					value === null ||
					(typeof value === "string" &&
						(value.trim() === "" || invalidValues.includes(value.trim().toLowerCase())))
				);
			});
		} else {
			// Extract numeric values for calculating statistics
			const numericValues = data
				.map((row) => row[columnName])
				.filter((value) => {
					if (value === undefined || value === null) return false;
					if (
						typeof value === "string" &&
						(value.trim() === "" || invalidValues.includes(value.trim().toLowerCase()))
					)
						return false;
					return !isNaN(Number(value));
				})
				.map((value) => Number(value));

			// Handle different fill operations
			let fillValue: string;

			switch (operation) {
				case "fill-mean":
					fillValue = String(mean(numericValues) || "");
					break;
				case "fill-median":
					fillValue = String(median(numericValues) || "");
					break;
				case "fill-mode":
					fillValue = String(mode(numericValues) || "");
					break;
				case "fill-custom":
					fillValue = customValue || "";
					break;
				default:
					return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
			}

			// Replace missing values with the calculated fill value
			processedData = data.map((row) => {
				const newRow = { ...row };
				const value = row[columnName];

				// Check if the value is missing or invalid
				if (
					value === undefined ||
					value === null ||
					(typeof value === "string" &&
						(value.trim() === "" || invalidValues.includes(value.trim().toLowerCase())))
				) {
					newRow[columnName] = fillValue;
				}

				return newRow;
			});
		}

		// Convert back to CSV
		const csv = Papa.unparse(processedData);

		return new NextResponse(csv, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="cleaned_${file.name}"`,
			},
		});
	} catch (error) {
		console.error("Error processing data:", error);
		return NextResponse.json({ error: "Error processing data" }, { status: 500 });
	}
}
