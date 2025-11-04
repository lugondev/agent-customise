import type { Router as IRouter, RouteDecision } from "@agent/shared";

export class HybridRouter implements IRouter {
	constructor(private readonly opts: { rules?: Array<{ if: RegExp; routeTo: string }>; fallback: string }) { }

	async route(input: { text: string }): Promise<RouteDecision> {
		const text = input.text || "";
		const rule = this.opts.rules?.find((r) => r.if.test(text));
		if (rule) {
			return { agentId: rule.routeTo, confidence: 0.9, reasoning: "Matched rule" };
		}
		return { agentId: this.opts.fallback, confidence: 0.5, reasoning: "Fallback" };
	}
}
