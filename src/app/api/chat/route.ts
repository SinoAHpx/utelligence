import { NextResponse } from "next/server";
import { dataVisualizationAgent } from "@/utils/mastra/agents/data-visualization-agent";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { messages } = json
    console.log('--------------')
    console.log(json)
    console.log('--------------')

    const stream = await dataVisualizationAgent.stream(messages);

    return stream.toDataStreamResponse()
  } catch (error) {
    console.error(JSON.stringify(error));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
