import type { ChatMessage, ChatResult, ProviderAdapter } from "../types/provider";
import type { ModelBus, ModelConfig } from "../types/model_bus";

export class DefaultModelBus implements ModelBus {
	constructor(
		private readonly models: Record<string, ModelConfig>,
		private readonly providers: Record<string, ProviderAdapter>
	) { }

	async call(opts: { modelId: string; messages: ChatMessage[]; temperature?: number; maxTokens?: number; }): Promise<ChatResult> {
		const model = this.models[opts.modelId];
		if (!model) throw new Error(`Unknown modelId: ${opts.modelId}`);
		const primary = this.providers[model.provider];
		const tryPrimary = async (): Promise<ChatResult> => {
			if (!primary) throw new Error(`Provider not configured: ${model.provider}`);
			return primary.chat({
				messages: opts.messages,
				temperature: opts.temperature,
				maxTokens: opts.maxTokens,
				model: model.name,
			});
		};

		try {
			return await tryPrimary();
		} catch (err) {
			// Attempt fallback if defined
			const fb = model.fallback;
			if (fb) {
				const fallbackProvider = this.providers[fb.provider];
				if (fallbackProvider) {
					return fallbackProvider.chat({
						messages: opts.messages,
						temperature: opts.temperature,
						maxTokens: opts.maxTokens,
						model: fb.name,
					});
				}
			}
			throw err;
		}
	}
}
