import { Injectable } from '@nestjs/common';
import { PlanGenerator, LinearExecutor } from '@agent/planner';
import { DefaultModelBus, AgentSpec } from '@agent/shared';
import { OpenAIAdapter } from '@agent/providers-openai';
import { OpenRouterAdapter } from '@agent/providers-openrouter';
import { AnthropicAdapter } from '@agent/providers-anthropic';
import { AppConfig, loadConfig } from '@agent/config';
import { Plan, ExecutionResult } from '@agent/shared';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlannerService {
	private planGenerator: PlanGenerator;
	private executor: LinearExecutor;
	private config: AppConfig;

	constructor(private readonly prisma: PrismaService) {
		// Load configuration (same as ChatService)
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
		this.config = loadConfig(configJson);

		// Initialize providers
		const providers = {
			openai: new OpenAIAdapter(),
			openrouter: new OpenRouterAdapter(),
			anthropic: new AnthropicAdapter(),
		} as const;

		// Build model map
		const models = Object.fromEntries(
			this.config.models.map((m: AppConfig['models'][number]) => [m.id, m])
		);

		// Initialize ModelBus
		const modelBus = new DefaultModelBus(models, providers);

		// Initialize plan generator
		this.planGenerator = new PlanGenerator({
			maxSteps: 10,
			defaultParallelLimit: 1,
		});

		// Initialize executor
		this.executor = new LinearExecutor(
			modelBus,
			this.config.agents as AgentSpec[],
			{
				maxRetries: 3,
				retryDelay: 1000,
				timeout: 60000,
			}
		);
	}

	/**
	 * Generate a plan from a goal
	 */
	async generatePlan(goal: string): Promise<Plan> {
		return this.planGenerator.generatePlan(goal);
	}

	/**
	 * Execute a plan and return the result
	 */
	async executePlan(plan: Plan, runId: string): Promise<ExecutionResult> {
		return this.executor.execute(plan, { runId });
	}

	/**
	 * Generate and execute a plan from a goal
	 */
	async planAndExecute(goal: string): Promise<{
		plan: Plan;
		result: ExecutionResult;
		runId: string;
	}> {
		// Generate plan
		const plan = await this.generatePlan(goal);
		const runId = this.generateRunId();

		// Create Run record in database
		await this.prisma.run.create({
			data: {
				id: runId,
				goal,
				planJson: JSON.stringify(plan),
				status: 'running',
			},
		});

		try {
			// Execute plan
			const result = await this.executePlan(plan, runId);

			// Update Run with result
			await this.prisma.run.update({
				where: { id: runId },
				data: {
					status: 'completed',
					output: result.output,
				},
			});

			// Create Step records
			for (let i = 0; i < plan.steps.length; i++) {
				const step = plan.steps[i];
				const stepResult = result.steps[i];

				await this.prisma.step.create({
					data: {
						runId,
						stepId: step.id,
						title: step.title,
						status: stepResult?.status || 'pending',
						inputJson: JSON.stringify(step.inputs),
						outputJson: stepResult ? JSON.stringify(stepResult) : null,
						completedAt: stepResult?.status === 'completed' ? new Date() : null,
					},
				});
			}

			return { plan, result, runId };
		} catch (error) {
			// Update Run as failed
			await this.prisma.run.update({
				where: { id: runId },
				data: {
					status: 'failed',
					error: error instanceof Error ? error.message : 'Unknown error',
				},
			});

			throw error;
		}
	}

	/**
	 * Get run details by ID
	 */
	async getRunById(runId: string) {
		return this.prisma.run.findUnique({
			where: { id: runId },
			include: {
				steps: true,
				messages: true,
			},
		});
	}

	/**
	 * List all runs with pagination
	 */
	async listRuns(limit: number = 10, offset: number = 0) {
		return this.prisma.run.findMany({
			take: limit,
			skip: offset,
			orderBy: { createdAt: 'desc' },
			include: {
				steps: true,
			},
		});
	}

	private generateRunId(): string {
		return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
