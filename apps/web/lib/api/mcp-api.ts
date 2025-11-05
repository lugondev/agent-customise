import {
	McpServer,
	McpServerWithTools,
	CreateMcpServerDto,
	UpdateMcpServerDto,
	McpTool,
	CreateMcpToolDto,
	UpdateMcpToolDto,
	McpSetting,
	CreateMcpSettingDto,
	UpdateMcpSettingDto,
} from '@agent/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ==================== MCP Servers ====================

export async function createMcpServer(data: CreateMcpServerDto): Promise<McpServer> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to create MCP server: ${response.statusText}`);
	}

	return response.json();
}

export async function getAllMcpServers(): Promise<McpServer[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP servers: ${response.statusText}`);
	}

	return response.json();
}

export async function getEnabledMcpServers(): Promise<McpServer[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers/enabled`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch enabled MCP servers: ${response.statusText}`);
	}

	return response.json();
}

export async function getMcpServerById(id: string): Promise<McpServer> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers/${id}`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP server: ${response.statusText}`);
	}

	return response.json();
}

export async function getMcpServerWithTools(id: string): Promise<McpServerWithTools> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers/${id}/with-tools`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP server with tools: ${response.statusText}`);
	}

	return response.json();
}

export async function updateMcpServer(
	id: string,
	data: UpdateMcpServerDto,
): Promise<McpServer> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to update MCP server: ${response.statusText}`);
	}

	return response.json();
}

export async function deleteMcpServer(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/mcp/servers/${id}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		throw new Error(`Failed to delete MCP server: ${response.statusText}`);
	}
}

// ==================== MCP Tools ====================

export async function createMcpTool(data: CreateMcpToolDto): Promise<McpTool> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to create MCP tool: ${response.statusText}`);
	}

	return response.json();
}

export async function getAllMcpTools(): Promise<McpTool[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP tools: ${response.statusText}`);
	}

	return response.json();
}

export async function getMcpToolsByServerId(serverId: string): Promise<McpTool[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools/server/${serverId}`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP tools: ${response.statusText}`);
	}

	return response.json();
}

export async function getEnabledMcpToolsByServerId(serverId: string): Promise<McpTool[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools/server/${serverId}/enabled`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch enabled MCP tools: ${response.statusText}`);
	}

	return response.json();
}

export async function getMcpToolById(id: string): Promise<McpTool> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools/${id}`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP tool: ${response.statusText}`);
	}

	return response.json();
}

export async function updateMcpTool(
	id: string,
	data: UpdateMcpToolDto,
): Promise<McpTool> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to update MCP tool: ${response.statusText}`);
	}

	return response.json();
}

export async function deleteMcpTool(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/mcp/tools/${id}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		throw new Error(`Failed to delete MCP tool: ${response.statusText}`);
	}
}

// ==================== MCP Settings ====================

export async function createMcpSetting(data: CreateMcpSettingDto): Promise<McpSetting> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to create MCP setting: ${response.statusText}`);
	}

	return response.json();
}

export async function getAllMcpSettings(): Promise<McpSetting[]> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP settings: ${response.statusText}`);
	}

	return response.json();
}

export async function getMcpSettingByKey(key: string): Promise<McpSetting> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings/${key}`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch MCP setting: ${response.statusText}`);
	}

	return response.json();
}

export async function updateMcpSetting(
	key: string,
	data: UpdateMcpSettingDto,
): Promise<McpSetting> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings/${key}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to update MCP setting: ${response.statusText}`);
	}

	return response.json();
}

export async function upsertMcpSetting(key: string, value: unknown): Promise<McpSetting> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings/${key}/upsert`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ value }),
	});

	if (!response.ok) {
		throw new Error(`Failed to upsert MCP setting: ${response.statusText}`);
	}

	return response.json();
}

export async function deleteMcpSetting(key: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/mcp/settings/${key}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		throw new Error(`Failed to delete MCP setting: ${response.statusText}`);
	}
}
