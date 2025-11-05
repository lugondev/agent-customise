import { Injectable } from '@nestjs/common';
import { HybridRouter } from '@agent/router';
import { DefaultModelBus, AgentSpec, ChatMessage, AgentNotFoundError } from '@agent/shared';
import { OpenAIAdapter } from '@agent/providers-openai';
import { OpenRouterAdapter } from '@agent/providers-openrouter';
import { AnthropicAdapter } from '@agent/providers-anthropic';
import { AppConfig, loadConfig } from '@agent/config';
import { McpExecutorService } from '../mcp/mcp-executor.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatService {
	private readonly cfg: AppConfig;
	private readonly router: HybridRouter;
	private readonly modelBus: DefaultModelBus;

	constructor(private readonly mcpExecutor: McpExecutorService) {
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

		// Add MCP tools information to system prompt if available
		const availableTools = await this.mcpExecutor.getAvailableTools();
		if (availableTools.length > 0) {
			const toolsDescription = this.formatToolsForPrompt(availableTools);
			messages.push({
				role: 'system',
				content: `You have access to the following tools:\n\n${toolsDescription}\n\nTo use a tool, respond with JSON in this format:\n{"use_tool": true, "server_id": "<server_id>", "tool_name": "<tool_name>", "arguments": {}}`,
			});
		}

		// Add user input
		messages.push({ role: 'user', content: input });

		// First LLM call
		const res = await this.modelBus.call({ modelId: agent.modelId, messages });
		let finalOutput = res.text;

		// Check if agent wants to use a tool
		const toolCall = this.extractToolCall(res.text);
		if (toolCall) {
			// Execute tool
			const toolResult = await this.mcpExecutor.executeToolCall(toolCall);

			if (toolResult.success) {
				// Add tool result to conversation and ask LLM to formulate final answer
				messages.push({ role: 'assistant', content: res.text });
				messages.push({
					role: 'user',
					content: `Tool result:\n${toolResult.content}\n\nPlease provide a natural language response to the user based on this information.`,
				});

				// Second LLM call with tool result
				const finalRes = await this.modelBus.call({ modelId: agent.modelId, messages });
				finalOutput = finalRes.text;
			} else {
				finalOutput = `I tried to get that information but encountered an error: ${toolResult.error}`;
			}
		}

		return { agentId: agent.id, output: finalOutput };
	}

	/**
	 * Format available tools for system prompt
	 */
	private formatToolsForPrompt(tools: Array<{ serverId: string; serverName: string; tool: any }>): string {
		return tools
			.map((t) => {
				const schema = typeof t.tool.schema === 'string' ? JSON.parse(t.tool.schema) : t.tool.schema;
				return `- **${t.tool.name}** (${t.serverName})\n  ID: ${t.serverId}\n  Description: ${t.tool.description || 'No description'}\n  Parameters: ${JSON.stringify(schema.properties || {})}`;
			})
			.join('\n\n');
	}

	/**
	 * Extract tool call from LLM response
	 */
	private extractToolCall(text: string): { serverId: string; toolName: string; arguments: Record<string, any> } | null {
		try {
			// Try to find JSON in the response
			const jsonMatch = text.match(/\{[^}]*"use_tool"\s*:\s*true[^}]*\}/);
			if (!jsonMatch) return null;

			const toolCall = JSON.parse(jsonMatch[0]);
			if (toolCall.use_tool && toolCall.server_id && toolCall.tool_name) {
				return {
					serverId: toolCall.server_id,
					toolName: toolCall.tool_name,
					arguments: toolCall.arguments || {},
				};
			}
		} catch (error) {
			// Not a valid tool call
		}
		return null;
	}
}
