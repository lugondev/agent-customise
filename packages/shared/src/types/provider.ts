// English comments only
export interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
}

export interface ChatInput {
	messages: ChatMessage[];
	maxTokens?: number;
	temperature?: number;
	stop?: string[];
	model?: string; // optional per-call model override
}

export interface ChatResult {
	text: string;
	usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
	raw?: unknown;
}

export interface ProviderAdapter {
	id: string; // 'openai' | 'anthropic' | 'xai' | 'qwen' | 'openrouter'
	chat(input: ChatInput): Promise<ChatResult>;
	stream?(input: ChatInput): AsyncIterable<{ delta: string }>;
}
