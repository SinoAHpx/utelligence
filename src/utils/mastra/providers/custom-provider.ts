import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const customProvider = createOpenAICompatible({
	name: "Volcano Engine",
	apiKey: process.env.API_KEY,
	baseURL: process.env.URL!,
});