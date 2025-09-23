import { dataVisualizationAgent } from "@/utils/mastra/agents/data-visualization-agent";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: messages array is required",
        },
        { status: 400 }
      );
    }

    // Validate messages format
    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: messages array cannot be empty",
        },
        { status: 400 }
      );
    }

    // Validate message structure
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request: each message must have role and content",
          },
          { status: 400 }
        );
      }
    }

    const stream = await dataVisualizationAgent.streamVNext(messages);

    // Convert string stream to Uint8Array stream for Response compatibility
    const textEncoder = new TextEncoder();
    const transformedStream = new ReadableStream({
      start(controller) {
        const reader = stream.textStream.getReader();
        function pump(): any {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(textEncoder.encode(value));
            return pump();
          });
        }
        return pump();
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("Chat API Error:", JSON.stringify(error));

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
