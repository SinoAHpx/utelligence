import { visualizationChartStore } from "@/store";
import { useFileUploadStore } from "@/store/file-upload-store";
import { ChartConfig, ChartType } from "@/types/chart-types";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const createChart = async ({
    chartType,
    title,
    xAxisColumn,
    yAxisColumn,
}: {
    chartType: ChartType;
    title?: string;
    xAxisColumn?: string;
    yAxisColumn?: string;
}) => {
    
    return true
};

export const visualization = createTool({
    id: "Create visualization charts",
    inputSchema: z.object({
        chartType: z.enum(["bar", "line", "area", "pie", "scatter", "radar"])
            .describe("Type of chart to create. Supported types: bar, line, area, pie, scatter, radar."),
        title: z.string().optional().describe("Title of the chart."),
        xAxisColumn: z.string().optional().describe("Name of the column to use for the X axis."),
        yAxisColumn: z.string().optional().describe("Name of the column to use for the Y axis (single value).")
    }),
    description: `Create visualization charts based on user's request. `,
    execute: async ({ context }) => {
        // Complete params based on inputSchema
        const { chartType, title, xAxisColumn, yAxisColumn } = context;
        console.log(`To create chart with context of ${JSON.stringify(context)}`)
        // Invoke createChart with destructured params
        const result = await createChart({ chartType, title, xAxisColumn, yAxisColumn });
        return result
    },
});