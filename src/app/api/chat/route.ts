import { NextResponse } from "next/server";
import { dataVisualizationAgent } from "@/utils/mastra/agents/data-visualization-agent";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const stream = await dataVisualizationAgent.stream(messages);

    return stream.toDataStreamResponse()
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
