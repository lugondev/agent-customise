export interface McpServer {
	id: string;
	name: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
	enabled: boolean;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMcpServerDto {
	name: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
	enabled?: boolean;
	description?: string;
}

export interface UpdateMcpServerDto {
	name?: string;
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	enabled?: boolean;
	description?: string;
}

export interface McpTool {
	id: string;
	serverId: string;
	name: string;
	description?: string;
	schema: Record<string, any>;
	enabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMcpToolDto {
	serverId: string;
	name: string;
	description?: string;
	schema: Record<string, any>;
	enabled?: boolean;
}

export interface UpdateMcpToolDto {
	name?: string;
	description?: string;
	schema?: Record<string, any>;
	enabled?: boolean;
}

export interface McpSetting {
	id: string;
	key: string;
	value: any;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMcpSettingDto {
	key: string;
	value: any;
}

export interface UpdateMcpSettingDto {
	value: any;
}

export interface McpServerWithTools extends McpServer {
	tools?: McpTool[];
}
