import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	HttpCode,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common';
import { McpServerService } from './mcp-server.service';
import { McpToolService } from './mcp-tool.service';
import { McpSettingService } from './mcp-setting.service';
import {
	CreateMcpServerDto,
	UpdateMcpServerDto,
	CreateMcpToolDto,
	UpdateMcpToolDto,
	CreateMcpSettingDto,
	UpdateMcpSettingDto,
} from '@agent/shared';

@Controller('mcp')
export class McpController {
	constructor(
		private readonly serverService: McpServerService,
		private readonly toolService: McpToolService,
		private readonly settingService: McpSettingService,
	) { }

	// ==================== MCP Servers ====================

	@Post('servers')
	@HttpCode(HttpStatus.CREATED)
	async createServer(@Body() dto: CreateMcpServerDto) {
		return this.serverService.createServer(dto);
	}

	@Get('servers')
	async getAllServers() {
		return this.serverService.findAllServers();
	}

	@Get('servers/enabled')
	async getEnabledServers() {
		return this.serverService.findEnabledServers();
	}

	@Get('servers/:id')
	async getServerById(@Param('id') id: string) {
		const server = await this.serverService.findServerById(id);
		if (!server) {
			throw new NotFoundException(`MCP server with ID ${id} not found`);
		}
		return server;
	}

	@Get('servers/:id/with-tools')
	async getServerWithTools(@Param('id') id: string) {
		const server = await this.serverService.findServerWithTools(id);
		if (!server) {
			throw new NotFoundException(`MCP server with ID ${id} not found`);
		}
		return server;
	}

	@Put('servers/:id')
	async updateServer(
		@Param('id') id: string,
		@Body() dto: UpdateMcpServerDto,
	) {
		try {
			return await this.serverService.updateServer(id, dto);
		} catch (error) {
			throw new NotFoundException(`MCP server with ID ${id} not found`);
		}
	}

	@Delete('servers/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteServer(@Param('id') id: string) {
		try {
			await this.serverService.deleteServer(id);
		} catch (error) {
			throw new NotFoundException(`MCP server with ID ${id} not found`);
		}
	}

	// ==================== MCP Tools ====================

	@Post('tools')
	@HttpCode(HttpStatus.CREATED)
	async createTool(@Body() dto: CreateMcpToolDto) {
		return this.toolService.createTool(dto);
	}

	@Get('tools')
	async getAllTools() {
		return this.toolService.findAllTools();
	}

	@Get('tools/server/:serverId')
	async getToolsByServerId(@Param('serverId') serverId: string) {
		return this.toolService.findToolsByServerId(serverId);
	}

	@Get('tools/server/:serverId/enabled')
	async getEnabledToolsByServerId(@Param('serverId') serverId: string) {
		return this.toolService.findEnabledToolsByServerId(serverId);
	}

	@Get('tools/:id')
	async getToolById(@Param('id') id: string) {
		const tool = await this.toolService.findToolById(id);
		if (!tool) {
			throw new NotFoundException(`MCP tool with ID ${id} not found`);
		}
		return tool;
	}

	@Put('tools/:id')
	async updateTool(
		@Param('id') id: string,
		@Body() dto: UpdateMcpToolDto,
	) {
		try {
			return await this.toolService.updateTool(id, dto);
		} catch (error) {
			throw new NotFoundException(`MCP tool with ID ${id} not found`);
		}
	}

	@Delete('tools/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteTool(@Param('id') id: string) {
		try {
			await this.toolService.deleteTool(id);
		} catch (error) {
			throw new NotFoundException(`MCP tool with ID ${id} not found`);
		}
	}

	// ==================== MCP Settings ====================

	@Post('settings')
	@HttpCode(HttpStatus.CREATED)
	async createSetting(@Body() dto: CreateMcpSettingDto) {
		return this.settingService.createSetting(dto);
	}

	@Get('settings')
	async getAllSettings() {
		return this.settingService.findAllSettings();
	}

	@Get('settings/:key')
	async getSettingByKey(@Param('key') key: string) {
		const setting = await this.settingService.findSettingByKey(key);
		if (!setting) {
			throw new NotFoundException(`MCP setting with key ${key} not found`);
		}
		return setting;
	}

	@Put('settings/:key')
	async updateSetting(
		@Param('key') key: string,
		@Body() dto: UpdateMcpSettingDto,
	) {
		try {
			return await this.settingService.updateSetting(key, dto);
		} catch (error) {
			throw new NotFoundException(`MCP setting with key ${key} not found`);
		}
	}

	@Post('settings/:key/upsert')
	async upsertSetting(
		@Param('key') key: string,
		@Body('value') value: any,
	) {
		return this.settingService.upsertSetting(key, value);
	}

	@Delete('settings/:key')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteSetting(@Param('key') key: string) {
		try {
			await this.settingService.deleteSetting(key);
		} catch (error) {
			throw new NotFoundException(`MCP setting with key ${key} not found`);
		}
	}
}
