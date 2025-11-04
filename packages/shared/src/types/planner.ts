export interface Plan { goal: string; steps: Step[]; }
export interface Step {
	id: string;
	title: string;
	inputs: Record<string, unknown>;
	dependsOn?: string[];
	agentHint?: string;
	tool?: string;
}

export interface ExecutionContext { runId: string; }
export interface ExecutionResult { output: string; steps: Array<{ id: string; status: string }>; }

export interface Executor {
	execute(plan: Plan, ctx: ExecutionContext): Promise<ExecutionResult>;
}
