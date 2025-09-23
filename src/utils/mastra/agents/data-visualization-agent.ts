import { Agent } from "@mastra/core/agent";
import { customProvider } from "../providers/custom-provider";
import { visualization } from "../tools/visualization-tool";

export const dataVisualizationAgent = new Agent({
	name: "Data Visualization Agent",
	instructions: "You are a helpful assistant.",
	model: customProvider.chatModel(process.env.MODEL!),
	tools: {
		visualization: visualization,
	},
});
