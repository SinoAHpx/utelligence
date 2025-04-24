import { Agent } from "@mastra/core/agent";
import { volcano } from "../providers/volcano-engine";

export const dataVisualizationAgent = new Agent({
    name: "Data Visualization Agent",
    instructions: "You are a helpful assistant.",
    model: volcano.chatModel(process.env.MODEL!),
    // tools: {
    //     repoInfo: repoInfo
    // }
});