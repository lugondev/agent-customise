import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
	CreateMcpToolDto,
	UpdateMcpToolDto,
	McpTool,
} from '@agent/shared';

@Injectable()
export class McpToolService {
	constructor(private readonly prisma: PrismaService) { }

	async createTool(dto: CreateMcpToolDto): Promise<McpTool> {
		const tool = await this.prisma.mcpTool.create({
			data: {
				serverId: dto.serverId,
				name: dto.name,
				description: dto.description,
				schemaJson: JSON.stringify(dto.schema),
				enabled: dto.enabled ?? true,
			},
		});

		return this.mapToMcpTool(tool);
	}

	async findAllTools(): Promise<McpTool[]> {
		const tools = await this.prisma.mcpTool.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return tools.map(this.mapToMcpTool);
	}

	async findToolsByServerId(serverId: string): Promise<McpTool[]> {
		const tools = await this.prisma.mcpTool.findMany({
			where: { serverId },
			orderBy: { createdAt: 'desc' },
		});

		return tools.map(this.mapToMcpTool);
	}

	async findToolById(id: string): Promise<McpTool | null> {
		const tool = await this.prisma.mcpTool.findUnique({
			where: { id },
		});

		return tool ? this.mapToMcpTool(tool) : null;
	}

	async updateTool(id: string, dto: UpdateMcpToolDto): Promise<McpTool> {
		const data: any = {};

		if (dto.name !== undefined) data.name = dto.name;
		if (dto.description !== undefined) data.description = dto.description;
		if (dto.schema !== undefined) data.schemaJson = JSON.stringify(dto.schema);
		if (dto.enabled !== undefined) data.enabled = dto.enabled;

		const tool = await this.prisma.mcpTool.update({
			where: { id },
			data,
		});

		return this.mapToMcpTool(tool);
	}

	async deleteTool(id: string): Promise<void> {
		await this.prisma.mcpTool.delete({
			where: { id },
		});
	}

	async findEnabledToolsByServerId(serverId: string): Promise<McpTool[]> {
		const tools = await this.prisma.mcpTool.findMany({
			where: {
				serverId,
				enabled: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		return tools.map(this.mapToMcpTool);
	}

	private mapToMcpTool(tool: any): McpTool {
		return {
			id: tool.id,
			serverId: tool.serverId,
			name: tool.name,
			description: tool.description || undefined,
			schema: JSON.parse(tool.schemaJson),
			enabled: tool.enabled,
			createdAt: tool.createdAt,
			updatedAt: tool.updatedAt,
		};
	}
}
