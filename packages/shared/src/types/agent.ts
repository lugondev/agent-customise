export interface AgentSpec {
	id: string;
	modelId: string;        // reference to ModelConfig.id
	roles: string[];        // domains e.g., ['tech', 'social']
	capabilities: string[]; // e.g., ['reasoning', 'creative']
	tools: string[];
	systemPrompt?: string;
	maxTokens?: number;
}
