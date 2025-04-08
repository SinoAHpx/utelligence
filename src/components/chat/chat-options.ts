/**
 * Configuration options for the chat interface and AI behavior
 *
 * @property selectedModel - The currently selected AI model
 * @property systemPrompt - Custom system prompt to set AI behavior
 * @property temperature - Temperature parameter for response randomness (0-1)
 */
export type ChatOptions = {
	selectedModel: string;
	systemPrompt: string;
	temperature: number;
};

/**
 * Default chat options when none are specified
 */
export const DEFAULT_CHAT_OPTIONS: ChatOptions = {
	selectedModel: "",
	systemPrompt: "You are a helpful AI assistant.",
	temperature: 0.7,
};
