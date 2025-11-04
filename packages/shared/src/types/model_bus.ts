import { ChatMessage, ChatResult } from "./provider";

export interface ModelConfig {
	id: string;        // e.g., 'gpt-4o', 'claude-3-5-sonnet'
	provider: string;  // 'openai' | 'anthropic' | ...
	name: string;      // provider's model name
	maxTokens?: number;
	fallback?: { provider: string; name: string }; // optional provider fallback (e.g., openrouter)
}

export interface ModelBus {
	call(opts: {
		modelId: string;
		messages: ChatMessage[];
		temperature?: number;
		maxTokens?: number;
	}): Promise<ChatResult>;
}
