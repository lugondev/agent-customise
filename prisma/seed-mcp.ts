import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding MCP data...');

	// Create sample MCP servers
	const filesystemServer = await prisma.mcpServer.create({
		data: {
			name: 'Filesystem MCP Server',
			command: 'npx',
			argsJson: JSON.stringify(['-y', '@modelcontextprotocol/server-filesystem', '/tmp']),
			envJson: null,
			enabled: true,
			description: 'Provides filesystem access to /tmp directory',
		},
	});

	console.log('✅ Created Filesystem MCP Server');

	const memoryServer = await prisma.mcpServer.create({
		data: {
			name: 'Memory MCP Server',
			command: 'npx',
			argsJson: JSON.stringify(['-y', '@modelcontextprotocol/server-memory']),
			envJson: null,
			enabled: true,
			description: 'Persistent memory across conversations',
		},
	});

	console.log('✅ Created Memory MCP Server');

	const githubServer = await prisma.mcpServer.create({
		data: {
			name: 'GitHub MCP Server',
			command: 'npx',
			argsJson: JSON.stringify(['-y', '@modelcontextprotocol/server-github']),
			envJson: JSON.stringify({ GITHUB_TOKEN: 'your_token_here' }),
			enabled: false,
			description: 'GitHub integration - requires GITHUB_TOKEN',
		},
	});

	console.log('✅ Created GitHub MCP Server');

	// Create sample tools
	await prisma.mcpTool.create({
		data: {
			serverId: filesystemServer.id,
			name: 'read_file',
			description: 'Read contents of a file',
			schemaJson: JSON.stringify({
				type: 'object',
				properties: {
					path: { type: 'string', description: 'File path to read' },
				},
				required: ['path'],
			}),
			enabled: true,
		},
	});

	await prisma.mcpTool.create({
		data: {
			serverId: filesystemServer.id,
			name: 'write_file',
			description: 'Write contents to a file',
			schemaJson: JSON.stringify({
				type: 'object',
				properties: {
					path: { type: 'string', description: 'File path to write' },
					content: { type: 'string', description: 'Content to write' },
				},
				required: ['path', 'content'],
			}),
			enabled: true,
		},
	});

	console.log('✅ Created filesystem tools');

	await prisma.mcpTool.create({
		data: {
			serverId: memoryServer.id,
			name: 'store',
			description: 'Store data in memory',
			schemaJson: JSON.stringify({
				type: 'object',
				properties: {
					key: { type: 'string', description: 'Memory key' },
					value: { type: 'string', description: 'Value to store' },
				},
				required: ['key', 'value'],
			}),
			enabled: true,
		},
	});

	await prisma.mcpTool.create({
		data: {
			serverId: memoryServer.id,
			name: 'retrieve',
			description: 'Retrieve data from memory',
			schemaJson: JSON.stringify({
				type: 'object',
				properties: {
					key: { type: 'string', description: 'Memory key to retrieve' },
				},
				required: ['key'],
			}),
			enabled: true,
		},
	});

	console.log('✅ Created memory tools');

	// Create sample settings
	await prisma.mcpSetting.create({
		data: {
			key: 'max_concurrent_servers',
			value: JSON.stringify(5),
		},
	});

	await prisma.mcpSetting.create({
		data: {
			key: 'default_timeout',
			value: JSON.stringify(30000),
		},
	});

	await prisma.mcpSetting.create({
		data: {
			key: 'auto_restart_on_failure',
			value: JSON.stringify(true),
		},
	});

	await prisma.mcpSetting.create({
		data: {
			key: 'log_level',
			value: JSON.stringify('info'),
		},
	});

	console.log('✅ Created MCP settings');

	console.log('🎉 Seed completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
