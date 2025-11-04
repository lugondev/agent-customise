import { Injectable } from '@nestjs/common';
import { HybridRouter } from '@agent/router';
import { DefaultModelBus, AgentSpec, ChatMessage, AgentNotFoundError } from '@agent/shared';
import { OpenAIAdapter } from '@agent/providers-openai';
import { OpenRouterAdapter } from '@agent/providers-openrouter';
import { AnthropicAdapter } from '@agent/providers-anthropic';
import { AppConfig, loadConfig } from '@agent/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatService {
	private readonly cfg: AppConfig;
	private readonly router: HybridRouter;
	private readonly modelBus: DefaultModelBus;

	constructor() {
		const candidates = [
			path.resolve(process.cwd(), 'config/agent.config.json'),
			path.resolve(process.cwd(), '../../config/agent.config.json'),
			path.resolve(__dirname, '../../../../config/agent.config.json'),
			path.resolve(__dirname, '../../../config/agent.config.json'),
			path.resolve(__dirname, '../../config/agent.config.json'),
		];
		const found = candidates.find((p) => fs.existsSync(p));
		if (!found) {
			throw new Error('agent.config.json not found in expected locations');
		}
		const configRaw = fs.readFileSync(found, 'utf-8');
		const configJson = JSON.parse(configRaw);
		this.cfg = loadConfig(configJson);

		const agents: Record<string, AgentSpec> = Object.fromEntries(
			this.cfg.agents.map((a: AgentSpec) => [a.id, a])
		);

		// Prepare provider adapters
		const providers = {
			openai: new OpenAIAdapter(),
			openrouter: new OpenRouterAdapter(),
			anthropic: new AnthropicAdapter(),
		} as const;

		// Build model map
		const models = Object.fromEntries(this.cfg.models.map((m: AppConfig['models'][number]) => [m.id, m]));
		this.modelBus = new DefaultModelBus(models, providers);

		// Router rules (regex compiled)
		const rules = (this.cfg.routing.rules || []).map((r: { if: string; routeTo: string }) => ({ if: new RegExp(r.if, 'i'), routeTo: r.routeTo }));
		this.router = new HybridRouter({ rules, fallback: this.cfg.routing.fallback });
	}

	async chat(input: string, agentId?: string): Promise<{ agentId: string; output: string }> {
		let targetAgent = agentId;
		if (!targetAgent) {
			const decision = await this.router.route({ text: input });
			targetAgent = decision.agentId;
		}
		const agent = this.cfg.agents.find((a: AgentSpec) => a.id === targetAgent);
		if (!agent) {
			throw new AgentNotFoundError(targetAgent);
		}

		const messages: ChatMessage[] = [];

		// Inject system prompt if available
		if (agent.systemPrompt) {
			messages.push({ role: 'system', content: agent.systemPrompt });
		}

		// Add user input
		messages.push({ role: 'user', content: input });

		const res = await this.modelBus.call({ modelId: agent.modelId, messages });
		return { agentId: agent.id, output: res.text };
	}
}
