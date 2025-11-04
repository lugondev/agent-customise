import type { ChatInput, ChatResult, ProviderAdapter } from "@agent/shared";

// Minimal OpenAI adapter with optional mock mode
export class OpenAIAdapter implements ProviderAdapter {
	id = "openai";

	async chat(input: ChatInput): Promise<ChatResult> {
		const mock = process.env.MOCK_PROVIDERS === "true";
		const apiKey = process.env.OPENAI_API_KEY;

		if (mock || !apiKey) {
			const last = input.messages[input.messages.length - 1]?.content ?? "";
			return { text: `(mock) Echo: ${last}` };
		}

		// Use fetch to avoid adding SDK dependency for skeleton
		const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
		const model = (input as { model?: string }).model || process.env.OPENAI_DEFAULT_MODEL || "gpt-4o";
		const res = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				messages: input.messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
				max_tokens: input.maxTokens ?? 512,
				temperature: input.temperature ?? 0.7,
			}),
		});

		if (!res.ok) {
			const errText = await res.text();
			throw new Error(`OpenAI error: ${res.status} ${errText}`);
		}

		const json: any = await res.json();
		const choice = json.choices?.[0]?.message?.content ?? "";
		const usage = json.usage ? {
			promptTokens: json.usage.prompt_tokens,
			completionTokens: json.usage.completion_tokens,
			totalTokens: json.usage.total_tokens,
		} : undefined;
		return { text: choice, usage, raw: json };
	}
}
