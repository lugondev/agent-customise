/**
 * Standard error codes for the application
 */
export enum ErrorCode {
	// General errors
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',

	// Provider errors
	PROVIDER_ERROR = 'PROVIDER_ERROR',
	PROVIDER_TIMEOUT = 'PROVIDER_TIMEOUT',
	PROVIDER_RATE_LIMIT = 'PROVIDER_RATE_LIMIT',
	PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',

	// Agent/Routing errors
	AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
	MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
	ROUTING_ERROR = 'ROUTING_ERROR',

	// Execution errors
	PLAN_GENERATION_FAILED = 'PLAN_GENERATION_FAILED',
	PLAN_EXECUTION_FAILED = 'PLAN_EXECUTION_FAILED',
	STEP_EXECUTION_FAILED = 'STEP_EXECUTION_FAILED',

	// Configuration errors
	CONFIG_INVALID = 'CONFIG_INVALID',
	CONFIG_MISSING = 'CONFIG_MISSING',
}

/**
 * Base application error class
 */
export class AppError extends Error {
	constructor(
		public readonly code: ErrorCode,
		message: string,
		public readonly statusCode: number = 500,
		public readonly details?: any
	) {
		super(message);
		this.name = 'AppError';
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			success: false,
			error: {
				code: this.code,
				message: this.message,
				details: this.details,
			},
		};
	}
}

/**
 * Specific error types
 */
export class ValidationError extends AppError {
	constructor(message: string, details?: any) {
		super(ErrorCode.VALIDATION_ERROR, message, 400, details);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, identifier?: string) {
		const message = identifier
			? `${resource} with ID '${identifier}' not found`
			: `${resource} not found`;
		super(ErrorCode.NOT_FOUND, message, 404);
		this.name = 'NotFoundError';
	}
}

export class ProviderError extends AppError {
	constructor(
		providerId: string,
		message: string,
		public readonly isRetryable: boolean = true,
		details?: any
	) {
		super(
			ErrorCode.PROVIDER_ERROR,
			`Provider '${providerId}' error: ${message}`,
			502,
			{ ...details, providerId, isRetryable }
		);
		this.name = 'ProviderError';
	}
}

export class ProviderTimeoutError extends AppError {
	constructor(providerId: string, timeout: number) {
		super(
			ErrorCode.PROVIDER_TIMEOUT,
			`Provider '${providerId}' timed out after ${timeout}ms`,
			504,
			{ providerId, timeout, isRetryable: true }
		);
		this.name = 'ProviderTimeoutError';
	}
}

export class ProviderRateLimitError extends AppError {
	constructor(providerId: string, retryAfter?: number) {
		super(
			ErrorCode.PROVIDER_RATE_LIMIT,
			`Provider '${providerId}' rate limit exceeded`,
			429,
			{ providerId, retryAfter, isRetryable: true }
		);
		this.name = 'ProviderRateLimitError';
	}
}

export class AgentNotFoundError extends AppError {
	constructor(agentId: string) {
		super(
			ErrorCode.AGENT_NOT_FOUND,
			`Agent '${agentId}' not found`,
			404,
			{ agentId }
		);
		this.name = 'AgentNotFoundError';
	}
}

export class ModelNotFoundError extends AppError {
	constructor(modelId: string) {
		super(
			ErrorCode.MODEL_NOT_FOUND,
			`Model '${modelId}' not found`,
			404,
			{ modelId }
		);
		this.name = 'ModelNotFoundError';
	}
}

export class PlanExecutionError extends AppError {
	constructor(message: string, details?: any) {
		super(
			ErrorCode.PLAN_EXECUTION_FAILED,
			message,
			500,
			details
		);
		this.name = 'PlanExecutionError';
	}
}
