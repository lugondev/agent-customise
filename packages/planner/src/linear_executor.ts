import {
	Plan,
	Step,
	ExecutionContext,
	ExecutionResult,
	Executor,
	ModelBus,
	AgentSpec,
} from '@agent/shared';

export interface LinearExecutorOptions {
	maxRetries?: number;
	retryDelay?: number;
	timeout?: number;
}

/**
 * Executes plan steps sequentially, respecting dependencies
 * Implements retry logic with exponential backoff
 */
export class LinearExecutor implements Executor {
	private modelBus: ModelBus;
	private agents: Map<string, AgentSpec>;
	private maxRetries: number;
	private retryDelay: number;
	private timeout: number;

	constructor(
		modelBus: ModelBus,
		agents: AgentSpec[],
		options: LinearExecutorOptions = {}
	) {
		this.modelBus = modelBus;
		this.agents = new Map(agents.map((a) => [a.id, a]));
		this.maxRetries = options.maxRetries || 3;
		this.retryDelay = options.retryDelay || 1000;
		this.timeout = options.timeout || 60000;
	}

	/**
	 * Execute a plan sequentially with dependency resolution
	 */
	async execute(plan: Plan, context: ExecutionContext): Promise<ExecutionResult> {
		const stepResults: Array<{ id: string; status: string }> = [];
		const stepOutputs: Map<string, any> = new Map();

		try {
			// Execute steps in order, checking dependencies
			for (const step of plan.steps) {
				// Check if dependencies are met
				if (step.dependsOn && step.dependsOn.length > 0) {
					const unmetDeps = step.dependsOn.filter(
						(depId: string) => !stepOutputs.has(depId)
					);
					if (unmetDeps.length > 0) {
						stepResults.push({ id: step.id, status: 'failed' });
						continue;
					}
				}

				// Execute step with retry logic
				try {
					const stepResult = await this.executeStepWithRetry(step, stepOutputs, context);
					stepOutputs.set(step.id, stepResult);
					stepResults.push({ id: step.id, status: 'completed' });
				} catch (error) {
					stepResults.push({ id: step.id, status: 'failed' });
				}
			}

			// Aggregate all outputs
			const allOutputs = Array.from(stepOutputs.values());
			const finalOutput = allOutputs.length > 0
				? allOutputs[allOutputs.length - 1]?.content || ''
				: '';

			return {
				output: finalOutput,
				steps: stepResults,
			};
		} catch (error) {
			return {
				output: error instanceof Error ? error.message : 'Unknown error',
				steps: stepResults,
			};
		}
	}

	/**
	 * Execute a single step with exponential backoff retry
	 */
	private async executeStepWithRetry(
		step: Step,
		previousOutputs: Map<string, any>,
		context: ExecutionContext
	): Promise<any> {
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				const result = await this.executeStep(step, previousOutputs, context);
				return result;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error('Unknown error');

				if (attempt < this.maxRetries) {
					// Exponential backoff: delay * 2^attempt
					const delay = this.retryDelay * Math.pow(2, attempt);
					await this.sleep(delay);
				}
			}
		}

		throw new Error(
			`Step ${step.id} failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`
		);
	}

	/**
	 * Execute a single step by calling the appropriate agent
	 */
	private async executeStep(
		step: Step,
		previousOutputs: Map<string, any>,
		context: ExecutionContext
	): Promise<any> {
		// Select agent based on agentHint or use default
		const agentId = step.agentHint || this.getDefaultAgentId();
		const agent = this.agents.get(agentId);

		if (!agent) {
			throw new Error(`Agent ${agentId} not found`);
		}

		// Prepare input with context from previous steps
		const enrichedInput = this.enrichStepInput(step, previousOutputs, context);

		// Build messages for the agent
		const messages = [
			{
				role: 'system' as const,
				content: agent.systemPrompt || 'You are a helpful assistant.',
			},
			{
				role: 'user' as const,
				content: this.buildStepPrompt(step, enrichedInput),
			},
		];

		// Call the model through ModelBus
		const result = await this.modelBus.call({
			modelId: agent.modelId,
			messages,
		});

		return {
			content: result.text,
			usage: result.usage,
		};
	}

	/**
	 * Get default agent ID (first agent in the map)
	 */
	private getDefaultAgentId(): string {
		const firstAgent = this.agents.values().next().value;
		return firstAgent?.id || 'generalist-gpt';
	}

	/**
	 * Enrich step input with outputs from dependent steps
	 */
	private enrichStepInput(
		step: Step,
		previousOutputs: Map<string, any>,
		context: ExecutionContext
	): any {
		const enriched: any = { ...step.inputs };

		// Add outputs from dependent steps
		if (step.dependsOn && step.dependsOn.length > 0) {
			enriched.previousSteps = {};
			for (const depId of step.dependsOn) {
				const output = previousOutputs.get(depId);
				if (output) {
					enriched.previousSteps[depId] = output;
				}
			}
		}

		// Add global context if provided
		enriched.runId = context.runId;

		return enriched;
	}

	/**
	 * Build a prompt for the step execution
	 */
	private buildStepPrompt(step: Step, input: any): string {
		let prompt = `Execute the following step:\n\n`;
		prompt += `Step ID: ${step.id}\n`;
		prompt += `Title: ${step.title}\n\n`;
		prompt += `Input:\n${JSON.stringify(input, null, 2)}\n\n`;
		prompt += `Please complete this step and provide the result.`;

		return prompt;
	}

	/**
	 * Utility function for async sleep
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
