import { z } from "zod";

export const ProviderConfigSchema = z.record(z.string(), z.object({
	apiKeyEnv: z.string(),
	baseUrl: z.string().optional(),
}));

export const ModelConfigSchema = z.object({
	id: z.string(),
	provider: z.string(),
	name: z.string(),
	maxTokens: z.number().optional(),
	costTier: z.string().optional(),
	fallback: z.object({ provider: z.string(), name: z.string() }).optional(),
});

export const AgentSpecSchema = z.object({
	id: z.string(),
	modelId: z.string(),
	roles: z.array(z.string()),
	capabilities: z.array(z.string()),
	tools: z.array(z.string()),
	systemPrompt: z.string().optional(),
	maxTokens: z.number().optional(),
});

export const RoutingConfigSchema = z.object({
	strategy: z.enum(["hybrid", "rules", "llm", "embeddings"]).default("hybrid"),
	rules: z.array(z.object({ if: z.string(), routeTo: z.string() })).optional(),
	llmRouter: z.object({ modelId: z.string(), fewShot: z.array(z.object({ input: z.string(), routeTo: z.string() })), maxCandidates: z.number().optional() }).optional(),
	fallback: z.string(),
});

export const PlannerConfigSchema = z.object({
	enabled: z.boolean().default(true),
	maxDepth: z.number().default(5),
	parallelLimit: z.number().default(3),
	defaultStrategy: z.enum(["linear", "task-graph"]).default("linear"),
});

export const AppConfigSchema = z.object({
	providers: ProviderConfigSchema,
	models: z.array(ModelConfigSchema),
	agents: z.array(AgentSpecSchema),
	routing: RoutingConfigSchema,
	planner: PlannerConfigSchema,
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(json: unknown): AppConfig {
	const parsed = AppConfigSchema.safeParse(json);
	if (!parsed.success) {
		const issues = parsed.error.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ");
		throw new Error(`Invalid config: ${issues}`);
	}
	return parsed.data;
}
