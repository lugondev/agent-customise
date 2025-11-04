import { Controller, Post, Get, Body, Param, Query, Sse, MessageEvent } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export class PlanExecuteDto {
	goal!: string;
}

@Controller('planner')
export class PlannerController {
	constructor(private readonly plannerService: PlannerService) { }

	/**
	 * POST /planner/plan-execute
	 * Generate plan and execute it
	 */
	@Post('plan-execute')
	async planExecute(@Body() dto: PlanExecuteDto) {
		const { goal } = dto;
		const result = await this.plannerService.planAndExecute(goal);

		return {
			success: true,
			data: result,
		};
	}

	/**
	 * POST /planner/plan
	 * Generate plan only
	 */
	@Post('plan')
	async generatePlan(@Body() dto: PlanExecuteDto) {
		const { goal } = dto;
		const plan = await this.plannerService.generatePlan(goal);

		return {
			success: true,
			data: plan,
		};
	}

	/**
	 * GET /planner/runs
	 * List all runs with pagination
	 */
	@Get('runs')
	async listRuns(
		@Query('limit') limit?: string,
		@Query('offset') offset?: string,
	) {
		const runs = await this.plannerService.listRuns(
			limit ? parseInt(limit) : 10,
			offset ? parseInt(offset) : 0,
		);

		return {
			success: true,
			data: runs,
		};
	}

	/**
	 * GET /planner/runs/:id
	 * Get run details by ID
	 */
	@Get('runs/:id')
	async getRunById(@Param('id') id: string) {
		const run = await this.plannerService.getRunById(id);

		if (!run) {
			return {
				success: false,
				error: 'Run not found',
			};
		}

		return {
			success: true,
			data: run,
		};
	}

	/**
	 * POST /planner/stream
	 * Generate and execute plan with SSE streaming
	 */
	@Sse('stream')
	streamPlanExecution(@Body() dto: PlanExecuteDto): Observable<MessageEvent> {
		return from(this.plannerService.planAndExecute(dto.goal)).pipe(
			mergeMap(async ({ plan, result, runId }) => {
				// Stream events for plan generation
				const events: MessageEvent[] = [];

				// Event 1: Plan generated
				events.push({
					data: JSON.stringify({
						type: 'plan',
						plan,
						runId,
					}),
				});

				// Event 2: Execution started
				events.push({
					data: JSON.stringify({
						type: 'execution_started',
						runId,
					}),
				});

				// Event 3: Steps progress
				result.steps.forEach((step) => {
					events.push({
						data: JSON.stringify({
							type: 'step',
							step,
						}),
					});
				});

				// Event 4: Execution completed
				events.push({
					data: JSON.stringify({
						type: 'execution_completed',
						result,
						runId,
					}),
				});

				return events;
			}),
			mergeMap((events) => from(events))
		);
	}
}
