import { NextResponse } from "next/server";
import Papa from "papaparse";
import { mean, standardDeviation } from "@/utils/statistics";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const columnName = formData.get("columnName") as string;
        const operation = formData.get("operation") as string;
        const method = formData.get("method") as string;
        const threshold = Number(formData.get("threshold")) || 3;

        if (!file || !columnName || !operation || !method) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
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
            return NextResponse.json(
                { error: `Column '${columnName}' not found` },
                { status: 400 }
            );
        }

        // Extract numeric values
        const values = data
            .map(row => row[columnName])
            .filter(value => value !== undefined && value !== null && value.trim() !== "" && !isNaN(Number(value)))
            .map(value => Number(value));

        if (values.length === 0) {
            return NextResponse.json(
                { error: "No numeric values found in the selected column" },
                { status: 400 }
            );
        }

        // Detect outliers based on the selected method
        const outlierIndices: number[] = [];
        let lowerBound = 0;
        let upperBound = 0;

        if (method === "zscore") {
            // Z-Score method: (x - mean) / stdDev > threshold
            const meanValue = mean(values) || 0;
            const stdDev = standardDeviation(values) || 1; // Prevent division by zero

            for (let i = 0; i < data.length; i++) {
                const value = Number(data[i][columnName]);
                if (!isNaN(value)) {
                    const zScore = Math.abs((value - meanValue) / stdDev);
                    if (zScore > threshold) {
                        outlierIndices.push(i);
                    }
                }
            }

            lowerBound = meanValue - threshold * stdDev;
            upperBound = meanValue + threshold * stdDev;
        }
        else if (method === "iqr") {
            // IQR method
            values.sort((a, b) => a - b);
            const q1Index = Math.floor(values.length * 0.25);
            const q3Index = Math.floor(values.length * 0.75);

            const q1 = values[q1Index];
            const q3 = values[q3Index];
            const iqr = q3 - q1;

            lowerBound = q1 - threshold * iqr;
            upperBound = q3 + threshold * iqr;

            for (let i = 0; i < data.length; i++) {
                const value = Number(data[i][columnName]);
                if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
                    outlierIndices.push(i);
                }
            }
        }
        else if (method === "percentile") {
            // Percentile method
            values.sort((a, b) => a - b);
            const lowerPercentile = threshold;
            const upperPercentile = 100 - threshold;

            const lowerIndex = Math.max(0, Math.floor(values.length * (lowerPercentile / 100)));
            const upperIndex = Math.min(values.length - 1, Math.floor(values.length * (upperPercentile / 100)));

            lowerBound = values[lowerIndex];
            upperBound = values[upperIndex];

            for (let i = 0; i < data.length; i++) {
                const value = Number(data[i][columnName]);
                if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
                    outlierIndices.push(i);
                }
            }
        }

        // Process the data based on the operation
        let processedData = [...data];

        if (operation === "remove-outliers") {
            // Remove rows with outliers
            processedData = data.filter((_, index) => !outlierIndices.includes(index));
        }
        else if (operation === "cap-outliers") {
            // Cap outliers to boundary values
            processedData = data.map((row, index) => {
                const newRow = { ...row };
                if (outlierIndices.includes(index)) {
                    const value = Number(row[columnName]);
                    if (!isNaN(value)) {
                        if (value < lowerBound) {
                            newRow[columnName] = String(lowerBound);
                        } else if (value > upperBound) {
                            newRow[columnName] = String(upperBound);
                        }
                    }
                }
                return newRow;
            });
        }

        // Convert back to CSV
        const csv = Papa.unparse(processedData);

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="outliers_cleaned_${file.name}"`,
            },
        });
    } catch (error) {
        console.error("Error processing outliers:", error);
        return NextResponse.json(
            { error: "Error processing outliers" },
            { status: 500 }
        );
    }
} 