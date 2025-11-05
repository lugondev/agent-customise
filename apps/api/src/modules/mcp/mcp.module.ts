import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpServerService } from './mcp-server.service';
import { McpToolService } from './mcp-tool.service';
import { McpSettingService } from './mcp-setting.service';
import { McpExecutorService } from './mcp-executor.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [McpController],
	providers: [McpServerService, McpToolService, McpSettingService, McpExecutorService],
	exports: [McpServerService, McpToolService, McpSettingService, McpExecutorService],
})
export class McpModule { }
