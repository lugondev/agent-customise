export interface RouteDecision {
	agentId: string;
	confidence: number;
	reasoning?: string;
	alternatives?: Array<{ agentId: string; score: number }>;
}

export interface Router {
	route(input: { text: string }): Promise<RouteDecision>;
}
