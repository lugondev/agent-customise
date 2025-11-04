/**
 * Circuit breaker states
 */
enum CircuitState {
	CLOSED = 'CLOSED', // Normal operation
	OPEN = 'OPEN', // Failing, reject requests immediately
	HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerOptions {
	failureThreshold?: number; // Number of failures before opening circuit
	successThreshold?: number; // Number of successes in half-open to close
	timeout?: number; // Time to wait before trying half-open (ms)
	resetTimeout?: number; // Time to reset failure count (ms)
}

/**
 * Circuit breaker pattern implementation
 * Protects against cascading failures from external services
 */
export class CircuitBreaker {
	private state: CircuitState = CircuitState.CLOSED;
	private failureCount: number = 0;
	private successCount: number = 0;
	private nextAttempt: number = Date.now();
	private lastFailureTime: number = 0;

	private readonly failureThreshold: number;
	private readonly successThreshold: number;
	private readonly timeout: number;
	private readonly resetTimeout: number;

	constructor(
		private readonly name: string,
		options: CircuitBreakerOptions = {}
	) {
		this.failureThreshold = options.failureThreshold || 5;
		this.successThreshold = options.successThreshold || 2;
		this.timeout = options.timeout || 60000; // 1 minute
		this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
	}

	/**
	 * Execute function with circuit breaker protection
	 */
	async execute<T>(fn: () => Promise<T>): Promise<T> {
		// Check if circuit should transition to half-open
		if (
			this.state === CircuitState.OPEN &&
			Date.now() >= this.nextAttempt
		) {
			this.state = CircuitState.HALF_OPEN;
			this.successCount = 0;
			console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
		}

		// Reject immediately if circuit is open
		if (this.state === CircuitState.OPEN) {
			const waitTime = Math.ceil((this.nextAttempt - Date.now()) / 1000);
			throw new Error(
				`Circuit breaker '${this.name}' is OPEN. Try again in ${waitTime}s`
			);
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	/**
	 * Handle successful execution
	 */
	private onSuccess(): void {
		// Reset failure count if enough time has passed
		if (Date.now() - this.lastFailureTime > this.resetTimeout) {
			this.failureCount = 0;
		}

		if (this.state === CircuitState.HALF_OPEN) {
			this.successCount++;
			if (this.successCount >= this.successThreshold) {
				this.close();
			}
		}
	}

	/**
	 * Handle failed execution
	 */
	private onFailure(): void {
		this.lastFailureTime = Date.now();
		this.failureCount++;

		if (
			this.state === CircuitState.HALF_OPEN ||
			this.failureCount >= this.failureThreshold
		) {
			this.open();
		}
	}

	/**
	 * Open the circuit (stop allowing requests)
	 */
	private open(): void {
		this.state = CircuitState.OPEN;
		this.nextAttempt = Date.now() + this.timeout;
		console.warn(
			`[CircuitBreaker:${this.name}] Circuit OPENED after ${this.failureCount} failures`
		);
	}

	/**
	 * Close the circuit (resume normal operation)
	 */
	private close(): void {
		this.state = CircuitState.CLOSED;
		this.failureCount = 0;
		this.successCount = 0;
		console.log(`[CircuitBreaker:${this.name}] Circuit CLOSED`);
	}

	/**
	 * Get current circuit state
	 */
	getState(): string {
		return this.state;
	}

	/**
	 * Get circuit statistics
	 */
	getStats() {
		return {
			name: this.name,
			state: this.state,
			failureCount: this.failureCount,
			successCount: this.successCount,
			nextAttempt: this.state === CircuitState.OPEN ? new Date(this.nextAttempt) : null,
		};
	}
}
