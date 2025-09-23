/**
 * Configuration options for the chat interface and AI behavior
 *
 * @property selectedModel - The currently selected AI model
 * @property systemPrompt - Custom system prompt to set AI behavior
 */
export type ChatOptions = {
	selectedModel: string;
	systemPrompt: string;
};

/**
 * Default chat options when none are specified
 */
export const DEFAULT_CHAT_OPTIONS: ChatOptions = {
	selectedModel: "",
	systemPrompt: "You are a helpful AI assistant.",
};
