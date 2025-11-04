import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '@agent/shared';

/**
 * Global exception filter to handle all errors consistently
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let errorResponse: any = {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
			timestamp: new Date().toISOString(),
			path: request.url,
		};

		// Handle AppError (our custom errors)
		if (exception instanceof AppError) {
			status = exception.statusCode;
			errorResponse = {
				success: false,
				error: {
					code: exception.code,
					message: exception.message,
					details: exception.details,
				},
				timestamp: new Date().toISOString(),
				path: request.url,
			};

			// Log based on severity
			if (status >= 500) {
				this.logger.error(
					`${exception.code}: ${exception.message}`,
					exception.stack
				);
			} else {
				this.logger.warn(`${exception.code}: ${exception.message}`);
			}
		}
		// Handle NestJS HttpException
		else if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			errorResponse = {
				success: false,
				error:
					typeof exceptionResponse === 'string'
						? { code: 'HTTP_ERROR', message: exceptionResponse }
						: exceptionResponse,
				timestamp: new Date().toISOString(),
				path: request.url,
			};

			this.logger.warn(`HTTP ${status}: ${JSON.stringify(exceptionResponse)}`);
		}
		// Handle unexpected errors
		else if (exception instanceof Error) {
			this.logger.error(
				`Unexpected error: ${exception.message}`,
				exception.stack
			);

			errorResponse.error.message = exception.message;

			// Don't expose internal error details in production
			if (process.env.NODE_ENV === 'production') {
				errorResponse.error.message = 'An unexpected error occurred';
			}
		}
		// Handle unknown errors
		else {
			this.logger.error(`Unknown error: ${JSON.stringify(exception)}`);
		}

		response.status(status).json(errorResponse);
	}
}
