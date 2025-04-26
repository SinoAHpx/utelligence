import { Agent } from "@mastra/core/agent";
import { volcano } from "../providers/volcano-engine";
import { visualization } from "../tools/visualization-tool";

export const dataVisualizationAgent = new Agent({
    name: "Data Visualization Agent",
    instructions: "You are a helpful assistant.",
    model: volcano.chatModel(process.env.MODEL!),
    tools: {
        visualization: visualization
    }
});

// const stream = await dataVisualizationAgent.stream('hi')
// for await (const textPart of stream.textStream) {
//     console.log(textPart);
// }