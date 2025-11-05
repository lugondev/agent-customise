#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Time Server - MCP server providing current time information
 * 
 * Available tools:
 * - get_current_time: Get current date and time
 * - get_timestamp: Get current Unix timestamp
 * - get_timezone: Get current timezone information
 * - format_time: Format a timestamp to readable string
 */

// Define available tools
const TOOLS: Tool[] = [
	{
		name: 'get_current_time',
		description: 'Get the current date and time in various formats (ISO, locale, UTC)',
		inputSchema: {
			type: 'object',
			properties: {
				format: {
					type: 'string',
					enum: ['iso', 'locale', 'utc', 'date', 'time'],
					description: 'Output format: iso (ISO 8601), locale (local string), utc (UTC string), date (date only), time (time only)',
					default: 'iso',
				},
				timezone: {
					type: 'string',
					description: 'IANA timezone name (e.g., "America/New_York", "Asia/Ho_Chi_Minh"). Defaults to system timezone.',
				},
			},
		},
	},
	{
		name: 'get_timestamp',
		description: 'Get the current Unix timestamp in seconds or milliseconds',
		inputSchema: {
			type: 'object',
			properties: {
				unit: {
					type: 'string',
					enum: ['seconds', 'milliseconds'],
					description: 'Timestamp unit',
					default: 'milliseconds',
				},
			},
		},
	},
	{
		name: 'get_timezone',
		description: 'Get information about the current timezone',
		inputSchema: {
			type: 'object',
			properties: {},
		},
	},
	{
		name: 'format_time',
		description: 'Format a Unix timestamp to a readable string',
		inputSchema: {
			type: 'object',
			properties: {
				timestamp: {
					type: 'number',
					description: 'Unix timestamp in milliseconds',
				},
				format: {
					type: 'string',
					enum: ['iso', 'locale', 'utc', 'date', 'time'],
					description: 'Output format',
					default: 'iso',
				},
				timezone: {
					type: 'string',
					description: 'IANA timezone name for formatting',
				},
			},
			required: ['timestamp'],
		},
	},
];

// Helper function to format date based on format type
function formatDate(date: Date, format: string, timezone?: string): string {
	const options: Intl.DateTimeFormatOptions = timezone
		? { timeZone: timezone }
		: {};

	switch (format) {
		case 'iso':
			return date.toISOString();
		case 'locale':
			return date.toLocaleString('en-US', {
				...options,
				dateStyle: 'full',
				timeStyle: 'long',
			});
		case 'utc':
			return date.toUTCString();
		case 'date':
			return date.toLocaleDateString('en-US', {
				...options,
				dateStyle: 'full',
			});
		case 'time':
			return date.toLocaleTimeString('en-US', {
				...options,
				timeStyle: 'long',
			});
		default:
			return date.toISOString();
	}
}

// Create MCP server instance
const server = new Server(
	{
		name: 'time-server',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: TOOLS,
	};
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case 'get_current_time': {
				const format = (args?.format as string) || 'iso';
				const timezone = args?.timezone as string | undefined;
				const now = new Date();
				const formattedTime = formatDate(now, format, timezone);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									time: formattedTime,
									format,
									timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
									timestamp: now.getTime(),
								},
								null,
								2
							),
						},
					],
				};
			}

			case 'get_timestamp': {
				const unit = (args?.unit as string) || 'milliseconds';
				const now = Date.now();
				const timestamp = unit === 'seconds' ? Math.floor(now / 1000) : now;

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									timestamp,
									unit,
									iso: new Date(now).toISOString(),
								},
								null,
								2
							),
						},
					],
				};
			}

			case 'get_timezone': {
				const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				const now = new Date();
				const offset = -now.getTimezoneOffset();
				const offsetHours = Math.floor(Math.abs(offset) / 60);
				const offsetMinutes = Math.abs(offset) % 60;
				const offsetString = `${offset >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									timezone,
									offset: offsetString,
									offsetMinutes: offset,
									isDST: now.getTimezoneOffset() < new Date(now.getFullYear(), 0, 1).getTimezoneOffset(),
								},
								null,
								2
							),
						},
					],
				};
			}

			case 'format_time': {
				const timestamp = args?.timestamp as number;
				if (!timestamp || typeof timestamp !== 'number') {
					throw new Error('Valid timestamp is required');
				}

				const format = (args?.format as string) || 'iso';
				const timezone = args?.timezone as string | undefined;
				const date = new Date(timestamp);
				const formattedTime = formatDate(date, format, timezone);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									time: formattedTime,
									format,
									timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
									inputTimestamp: timestamp,
								},
								null,
								2
							),
						},
					],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({ error: errorMessage }, null, 2),
				},
			],
			isError: true,
		};
	}
});

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	// Log to stderr so it doesn't interfere with MCP protocol on stdout
	console.error('Time Server MCP started successfully');
	console.error('Available tools: get_current_time, get_timestamp, get_timezone, format_time');
}

main().catch((error) => {
	console.error('Fatal error starting server:', error);
	process.exit(1);
});
