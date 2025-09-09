import { mean, stdev } from "@/utils/data/statistics";
import { NextResponse } from "next/server";
import Papa from "papaparse";

/**
 * Numeric data transformations
 */
function normalizeData(data: any[], columnName: string): any[] {
	// Calculate mean and standard deviation
	const values = data.map((row) => Number(row[columnName])).filter((val) => !isNaN(val));
	const dataMean = mean(values) || 0;
	const dataStd = stdev(values) || 1; // Avoid division by zero

	// Apply z-score normalization
	return data.map((row) => {
		const newRow = { ...row };
		const val = Number(row[columnName]);
		if (!isNaN(val) && dataStd > 0) {
			newRow[columnName] = String((val - dataMean) / dataStd);
		}
		return newRow;
	});
}

function scaleData(data: any[], columnName: string, minValue = 0, maxValue = 1): any[] {
	// Find min and max in the data
	const values = data.map((row) => Number(row[columnName])).filter((val) => !isNaN(val));
	const dataMin = Math.min(...values);
	const dataMax = Math.max(...values);
	const dataRange = dataMax - dataMin;

	// Apply min-max scaling
	return data.map((row) => {
		const newRow = { ...row };
		const val = Number(row[columnName]);
		if (!isNaN(val) && dataRange > 0) {
			const scaled = ((val - dataMin) / dataRange) * (maxValue - minValue) + minValue;
			newRow[columnName] = String(scaled);
		}
		return newRow;
	});
}

function logTransform(data: any[], columnName: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = Number(row[columnName]);
		if (!isNaN(val) && val > 0) {
			newRow[columnName] = String(Math.log(val));
		}
		return newRow;
	});
}

function squareRootTransform(data: any[], columnName: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = Number(row[columnName]);
		if (!isNaN(val) && val >= 0) {
			newRow[columnName] = String(Math.sqrt(val));
		}
		return newRow;
	});
}

/**
 * Text data transformations
 */
function lowercaseText(data: any[], columnName: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];
		if (typeof val === "string") {
			newRow[columnName] = val.toLowerCase();
		}
		return newRow;
	});
}

function uppercaseText(data: any[], columnName: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];
		if (typeof val === "string") {
			newRow[columnName] = val.toUpperCase();
		}
		return newRow;
	});
}

function trimText(data: any[], columnName: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];
		if (typeof val === "string") {
			newRow[columnName] = val.trim();
		}
		return newRow;
	});
}

function addPrefix(data: any[], columnName: string, prefix: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];
		if (val !== null && val !== undefined) {
			newRow[columnName] = prefix + val;
		}
		return newRow;
	});
}

function addSuffix(data: any[], columnName: string, suffix: string): any[] {
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];
		if (val !== null && val !== undefined) {
			newRow[columnName] = val + suffix;
		}
		return newRow;
	});
}

function regexReplace(
	data: any[],
	columnName: string,
	pattern: string,
	replacement: string
): any[] {
	try {
		const regex = new RegExp(pattern, "g");
		return data.map((row) => {
			const newRow = { ...row };
			const val = row[columnName];
			if (typeof val === "string") {
				newRow[columnName] = val.replace(regex, replacement);
			}
			return newRow;
		});
	} catch (error) {
		// Return original data if regex is invalid
		console.error("Invalid regex pattern:", error);
		return data;
	}
}

/**
 * Categorical data transformations
 */
function oneHotEncoding(data: any[], columnName: string): any[] {
	// Get unique values for the column
	const uniqueValues = new Set<string>();
	data.forEach((row) => {
		const val = row[columnName];
		if (val !== null && val !== undefined && val !== "") {
			uniqueValues.add(String(val));
		}
	});

	// Create one-hot encoded columns
	return data.map((row) => {
		const newRow = { ...row };
		const val = String(row[columnName]);

		// Add binary columns for each unique value
		Array.from(uniqueValues).forEach((uniqueVal) => {
			newRow[`${columnName}_${uniqueVal}`] = val === uniqueVal ? "1" : "0";
		});

		return newRow;
	});
}

function labelEncoding(data: any[], columnName: string): any[] {
	// Get unique values and create a mapping
	const uniqueValues = Array.from(
		new Set(
			data
				.map((row) => row[columnName])
				.filter((val) => val !== null && val !== undefined && val !== "")
				.map(String)
		)
	);

	const valueMap = new Map<string, number>();
	uniqueValues.forEach((val, index) => {
		valueMap.set(val, index);
	});

	// Apply the mapping
	return data.map((row) => {
		const newRow = { ...row };
		const val = row[columnName];

		if (val !== null && val !== undefined && val !== "") {
			newRow[`${columnName}_encoded`] = String(valueMap.get(String(val)) || "");
			// Keep the original value as well
			newRow[columnName] = val;
		} else {
			newRow[`${columnName}_encoded`] = "";
		}

		return newRow;
	});
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const columnsJson = formData.get("columns") as string;
		const transformType = formData.get("transformType") as string;
		const operation = formData.get("operation") as string;

		if (!file || !columnsJson || !transformType || !operation) {
			return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
		}

		const columns = JSON.parse(columnsJson) as string[];
		if (!Array.isArray(columns) || columns.length === 0) {
			return NextResponse.json({ error: "未选择任何列进行转换" }, { status: 400 });
		}

		// Parse the file
		const text = await file.text();
		const results = Papa.parse(text, {
			header: true,
			skipEmptyLines: true,
		});

		let data = results.data as Record<string, string>[];
		const headers = results.meta.fields || [];

		// Validate selected columns exist in the file
		for (const column of columns) {
			if (!headers.includes(column)) {
				return NextResponse.json({ error: `列 '${column}' 在文件中不存在` }, { status: 400 });
			}
		}

		// Get additional parameters based on operation
		let customText = "";
		let minValue = 0;
		let maxValue = 1;
		let regexPattern = "";
		let regexReplacement = "";

		if (transformType === "text" && (operation === "prefix" || operation === "suffix")) {
			customText = (formData.get("customText") as string) || "";
		} else if (transformType === "numeric" && operation === "scale") {
			minValue = Number(formData.get("minValue") as string) || 0;
			maxValue = Number(formData.get("maxValue") as string) || 1;
		} else if (transformType === "text" && operation === "regex") {
			regexPattern = (formData.get("regexPattern") as string) || "";
			regexReplacement = (formData.get("regexReplacement") as string) || "";
		}

		// Apply transformations to each selected column
		for (const column of columns) {
			if (transformType === "numeric") {
				switch (operation) {
					case "normalize":
						data = normalizeData(data, column);
						break;
					case "scale":
						data = scaleData(data, column, minValue, maxValue);
						break;
					case "log":
						data = logTransform(data, column);
						break;
					case "square-root":
						data = squareRootTransform(data, column);
						break;
				}
			} else if (transformType === "text") {
				switch (operation) {
					case "lowercase":
						data = lowercaseText(data, column);
						break;
					case "uppercase":
						data = uppercaseText(data, column);
						break;
					case "trim":
						data = trimText(data, column);
						break;
					case "prefix":
						data = addPrefix(data, column, customText);
						break;
					case "suffix":
						data = addSuffix(data, column, customText);
						break;
					case "regex":
						data = regexReplace(data, column, regexPattern, regexReplacement);
						break;
				}
			} else if (transformType === "categorical") {
				switch (operation) {
					case "one-hot":
						data = oneHotEncoding(data, column);
						break;
					case "label":
						data = labelEncoding(data, column);
						break;
				}
			}
		}

		// Convert back to CSV
		const csv = Papa.unparse(data);

		// Return the transformed data as CSV file
		return new NextResponse(csv, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="transformed_${file.name}"`,
			},
		});
	} catch (error) {
		console.error("数据转换错误:", error);
		return NextResponse.json({ error: "数据转换处理失败" }, { status: 500 });
	}
}
