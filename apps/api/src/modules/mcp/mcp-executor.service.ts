import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { McpServerService } from './mcp-server.service';
import { McpToolService } from './mcp-tool.service';
import { McpServer, McpTool } from '@agent/shared';

interface McpToolCall {
	serverId: string;
	toolName: string;
	arguments: Record<string, any>;
}

interface McpToolResult {
	success: boolean;
	content?: string;
	error?: string;
}

/**
 * MCP Executor Service
 * 
 * Manages MCP server processes and executes tool calls.
 * Spawns MCP servers on-demand and communicates via JSON-RPC over stdio.
 */
@Injectable()
export class McpExecutorService {
	private readonly logger = new Logger(McpExecutorService.name);
	private readonly processes: Map<string, ChildProcess> = new Map();
	private readonly responseCallbacks: Map<number, (response: any) => void> = new Map();
	private requestIdCounter = 0;

	constructor(
		private readonly mcpServerService: McpServerService,
		private readonly mcpToolService: McpToolService,
	) { }

	/**
	 * Get or spawn MCP server process
	 */
	private async getOrSpawnProcess(server: McpServer): Promise<ChildProcess> {
		const existingProcess = this.processes.get(server.id);
		if (existingProcess && !existingProcess.killed) {
			return existingProcess;
		}

		this.logger.log(`Spawning MCP server: ${server.name}`);

		// Spawn process
		const mcpProcess = spawn(server.command, server.args, {
			env: { ...process.env, ...(server.env || {}) },
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		// Store process
		this.processes.set(server.id, mcpProcess);

		// Handle stderr (logs)
		mcpProcess.stderr?.on('data', (data: Buffer) => {
			this.logger.debug(`[${server.name}] ${data.toString()}`);
		});

		// Handle stdout (JSON-RPC responses)
		let buffer = '';
		mcpProcess.stdout?.on('data', (data: Buffer) => {
			buffer += data.toString();
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const response = JSON.parse(line);
					if (response.id !== undefined) {
						const callback = this.responseCallbacks.get(response.id);
						if (callback) {
							callback(response);
							this.responseCallbacks.delete(response.id);
						}
					}
				} catch (error) {
					this.logger.error(`Failed to parse JSON-RPC response: ${line}`);
				}
			}
		});

		// Handle process exit
		mcpProcess.on('exit', (code: number | null) => {
			this.logger.warn(`MCP server ${server.name} exited with code ${code}`);
			this.processes.delete(server.id);
		});

		// Initialize connection
		await this.sendRequest(mcpProcess, {
			jsonrpc: '2.0',
			id: this.requestIdCounter++,
			method: 'initialize',
			params: {
				protocolVersion: '2024-11-05',
				capabilities: {},
				clientInfo: {
					name: 'agent-customise',
					version: '1.0.0',
				},
			},
		});

		return mcpProcess;
	}

	/**
	 * Send JSON-RPC request to MCP server
	 */
	private async sendRequest(
		mcpProcess: ChildProcess,
		request: any,
	): Promise<any> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.responseCallbacks.delete(request.id);
				reject(new Error('Request timeout'));
			}, 30000);

			this.responseCallbacks.set(request.id, (response) => {
				clearTimeout(timeout);
				if (response.error) {
					reject(new Error(response.error.message || 'RPC error'));
				} else {
					resolve(response.result);
				}
			});

			mcpProcess.stdin?.write(JSON.stringify(request) + '\n');
		});
	}

	/**
	 * Execute a tool call on an MCP server
	 */
	async executeToolCall(call: McpToolCall): Promise<McpToolResult> {
		try {
			// Get server from database
			const server = await this.mcpServerService.findServerById(call.serverId);
			if (!server) {
				return {
					success: false,
					error: `MCP server not found: ${call.serverId}`,
				};
			}

			if (!server.enabled) {
				return {
					success: false,
					error: `MCP server is disabled: ${server.name}`,
				};
			}

			// Get or spawn process
			const mcpProcess = await this.getOrSpawnProcess(server);

			// Execute tool call
			const result = await this.sendRequest(mcpProcess, {
				jsonrpc: '2.0',
				id: this.requestIdCounter++,
				method: 'tools/call',
				params: {
					name: call.toolName,
					arguments: call.arguments,
				},
			});

			// Extract content from MCP response
			const content = result.content?.[0]?.text || JSON.stringify(result);

			return {
				success: true,
				content,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Tool execution failed: ${errorMessage}`, errorStack);
			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	/**
	 * Get available tools from all enabled servers
	 */
	async getAvailableTools(): Promise<
		Array<{ serverId: string; serverName: string; tool: McpTool }>
	> {
		const servers = await this.mcpServerService.findEnabledServers();
		const allTools: Array<{
			serverId: string;
			serverName: string;
			tool: McpTool;
		}> = [];

		for (const server of servers) {
			const tools = await this.mcpToolService.findEnabledToolsByServerId(
				server.id,
			);
			for (const tool of tools) {
				allTools.push({
					serverId: server.id,
					serverName: server.name,
					tool,
				});
			}
		}

		return allTools;
	}

	/**
	 * Shutdown all MCP server processes
	 */
	async shutdown(): Promise<void> {
		this.logger.log('Shutting down all MCP servers...');
		for (const [serverId, mcpProcess] of this.processes.entries()) {
			try {
				mcpProcess.kill();
				this.logger.log(`Killed MCP server: ${serverId}`);
			} catch (error) {
				this.logger.error(`Failed to kill MCP server ${serverId}:`, error);
			}
		}
		this.processes.clear();
		this.responseCallbacks.clear();
	}
}
