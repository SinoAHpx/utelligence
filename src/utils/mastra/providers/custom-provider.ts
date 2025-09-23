import { createOpenAI } from "@ai-sdk/openai";

export const customProvider = createOpenAI({
	name: "Volcano Engine",
	apiKey: process.env.API_KEY,
	baseURL: process.env.URL,
});