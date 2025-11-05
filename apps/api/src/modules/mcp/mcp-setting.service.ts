import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
	CreateMcpSettingDto,
	UpdateMcpSettingDto,
	McpSetting,
} from '@agent/shared';

@Injectable()
export class McpSettingService {
	constructor(private readonly prisma: PrismaService) { }

	async createSetting(dto: CreateMcpSettingDto): Promise<McpSetting> {
		const setting = await this.prisma.mcpSetting.create({
			data: {
				key: dto.key,
				value: JSON.stringify(dto.value),
			},
		});

		return this.mapToMcpSetting(setting);
	}

	async findAllSettings(): Promise<McpSetting[]> {
		const settings = await this.prisma.mcpSetting.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return settings.map(this.mapToMcpSetting);
	}

	async findSettingByKey(key: string): Promise<McpSetting | null> {
		const setting = await this.prisma.mcpSetting.findUnique({
			where: { key },
		});

		return setting ? this.mapToMcpSetting(setting) : null;
	}

	async updateSetting(key: string, dto: UpdateMcpSettingDto): Promise<McpSetting> {
		const setting = await this.prisma.mcpSetting.update({
			where: { key },
			data: {
				value: JSON.stringify(dto.value),
			},
		});

		return this.mapToMcpSetting(setting);
	}

	async upsertSetting(key: string, value: any): Promise<McpSetting> {
		const setting = await this.prisma.mcpSetting.upsert({
			where: { key },
			create: {
				key,
				value: JSON.stringify(value),
			},
			update: {
				value: JSON.stringify(value),
			},
		});

		return this.mapToMcpSetting(setting);
	}

	async deleteSetting(key: string): Promise<void> {
		await this.prisma.mcpSetting.delete({
			where: { key },
		});
	}

	private mapToMcpSetting(setting: any): McpSetting {
		return {
			id: setting.id,
			key: setting.key,
			value: JSON.parse(setting.value),
			createdAt: setting.createdAt,
			updatedAt: setting.updatedAt,
		};
	}
}
