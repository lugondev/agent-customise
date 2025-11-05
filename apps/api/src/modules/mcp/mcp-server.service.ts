import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
	CreateMcpServerDto,
	UpdateMcpServerDto,
	McpServer,
	McpServerWithTools,
} from '@agent/shared';

@Injectable()
export class McpServerService {
	constructor(private readonly prisma: PrismaService) { }

	async createServer(dto: CreateMcpServerDto): Promise<McpServer> {
		const server = await this.prisma.mcpServer.create({
			data: {
				name: dto.name,
				command: dto.command,
				argsJson: JSON.stringify(dto.args),
				envJson: dto.env ? JSON.stringify(dto.env) : null,
				enabled: dto.enabled ?? true,
				description: dto.description,
			},
		});

		return this.mapToMcpServer(server);
	}

	async findAllServers(): Promise<McpServer[]> {
		const servers = await this.prisma.mcpServer.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return servers.map(this.mapToMcpServer);
	}

	async findServerById(id: string): Promise<McpServer | null> {
		const server = await this.prisma.mcpServer.findUnique({
			where: { id },
		});

		return server ? this.mapToMcpServer(server) : null;
	}

	async findServerWithTools(id: string): Promise<McpServerWithTools | null> {
		const server = await this.prisma.mcpServer.findUnique({
			where: { id },
		});

		if (!server) return null;

		const tools = await this.prisma.mcpTool.findMany({
			where: { serverId: id },
			orderBy: { createdAt: 'desc' },
		});

		return {
			...this.mapToMcpServer(server),
			tools: tools.map((tool) => ({
				id: tool.id,
				serverId: tool.serverId,
				name: tool.name,
				description: tool.description || undefined,
				schema: JSON.parse(tool.schemaJson),
				enabled: tool.enabled,
				createdAt: tool.createdAt,
				updatedAt: tool.updatedAt,
			})),
		};
	}

	async updateServer(
		id: string,
		dto: UpdateMcpServerDto,
	): Promise<McpServer> {
		const data: any = {};

		if (dto.name !== undefined) data.name = dto.name;
		if (dto.command !== undefined) data.command = dto.command;
		if (dto.args !== undefined) data.argsJson = JSON.stringify(dto.args);
		if (dto.env !== undefined)
			data.envJson = dto.env ? JSON.stringify(dto.env) : null;
		if (dto.enabled !== undefined) data.enabled = dto.enabled;
		if (dto.description !== undefined) data.description = dto.description;

		const server = await this.prisma.mcpServer.update({
			where: { id },
			data,
		});

		return this.mapToMcpServer(server);
	}

	async deleteServer(id: string): Promise<void> {
		// Delete associated tools first
		await this.prisma.mcpTool.deleteMany({
			where: { serverId: id },
		});

		// Delete the server
		await this.prisma.mcpServer.delete({
			where: { id },
		});
	}

	async findEnabledServers(): Promise<McpServer[]> {
		const servers = await this.prisma.mcpServer.findMany({
			where: { enabled: true },
			orderBy: { createdAt: 'desc' },
		});

		return servers.map(this.mapToMcpServer);
	}

	private mapToMcpServer(server: any): McpServer {
		return {
			id: server.id,
			name: server.name,
			command: server.command,
			args: JSON.parse(server.argsJson),
			env: server.envJson ? JSON.parse(server.envJson) : undefined,
			enabled: server.enabled,
			description: server.description || undefined,
			createdAt: server.createdAt,
			updatedAt: server.updatedAt,
		};
	}
}
