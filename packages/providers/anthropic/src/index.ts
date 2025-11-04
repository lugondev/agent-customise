import { ProviderAdapter, ChatInput, ChatResult, ChatMessage } from '@agent/shared';

/**
 * Anthropic Claude provider adapter
 * Supports Claude 3 models (Opus, Sonnet, Haiku)
 */
export class AnthropicAdapter implements ProviderAdapter {
	readonly id = 'anthropic';
	private apiKey: string;
	private baseURL: string;

	constructor() {
		this.apiKey = process.env.ANTHROPIC_API_KEY || '';
		this.baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';

		if (!this.apiKey && !process.env.MOCK_PROVIDERS) {
			console.warn('[AnthropicAdapter] ANTHROPIC_API_KEY not set. Set MOCK_PROVIDERS=true to use mock mode.');
		}
	}

	async chat(input: ChatInput): Promise<ChatResult> {
		// Mock mode for testing
		if (process.env.MOCK_PROVIDERS === 'true') {
			return this.mockResponse(input);
		}

		if (!this.apiKey) {
			throw new Error('ANTHROPIC_API_KEY not configured');
		}

		// Convert messages to Anthropic format
		const { system, messages } = this.convertMessages(input.messages);

		// Build request body
		const body: any = {
			model: input.model || 'claude-3-5-sonnet-20241022',
			max_tokens: input.maxTokens || 4096,
			messages,
		};

		if (system) {
			body.system = system;
		}

		if (input.temperature !== undefined) {
			body.temperature = input.temperature;
		}

		if (input.stop && input.stop.length > 0) {
			body.stop_sequences = input.stop;
		}

		// Call Anthropic API
		const response = await fetch(`${this.baseURL}/v1/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': this.apiKey,
				'anthropic-version': '2023-06-01',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();

		// Extract text from content blocks
		const text = data.content
			.filter((block: any) => block.type === 'text')
			.map((block: any) => block.text)
			.join('');

		return {
			text,
			usage: {
				promptTokens: data.usage?.input_tokens,
				completionTokens: data.usage?.output_tokens,
				totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
			},
			raw: data,
		};
	}

	/**
	 * Convert ChatMessage[] to Anthropic format
	 * Anthropic separates system messages from conversation messages
	 */
	private convertMessages(messages: ChatMessage[]): {
		system?: string;
		messages: Array<{ role: 'user' | 'assistant'; content: string }>;
	} {
		const systemMessages: string[] = [];
		const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

		for (const msg of messages) {
			if (msg.role === 'system') {
				systemMessages.push(msg.content);
			} else if (msg.role === 'user' || msg.role === 'assistant') {
				conversationMessages.push({
					role: msg.role,
					content: msg.content,
				});
			}
			// Skip 'tool' role as it's not directly supported in basic chat
		}

		return {
			system: systemMessages.length > 0 ? systemMessages.join('\n\n') : undefined,
			messages: conversationMessages,
		};
	}

	/**
	 * Mock response for testing without API key
	 */
	private mockResponse(input: ChatInput): ChatResult {
		const lastMessage = input.messages[input.messages.length - 1];
		return {
			text: `[MOCK Anthropic] Responding to: "${lastMessage?.content.substring(0, 50)}..."`,
			usage: {
				promptTokens: 100,
				completionTokens: 50,
				totalTokens: 150,
			},
		};
	}
}
