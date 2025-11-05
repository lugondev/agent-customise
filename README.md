# Agent Customise - Multi-Agent AI System

A TypeScript-first multi-agent AI orchestration platform with intelligent routing, plan execution, and multi-provider support.

## Features

- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter
- 🧠 **Intelligent Routing**: Rule-based + LLM routing for agent selection
- 📋 **Plan Execution**: Generate and execute multi-step plans with dependency resolution
- � **MCP Configuration**: Full-featured Model Context Protocol server & tool management
- �💾 **Persistence**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- 🔄 **Retry Logic**: Exponential backoff with circuit breaker pattern
- 🛡️ **Error Handling**: Production-ready error responses and logging
- 🔌 **Extensible**: Easy to add new providers, agents, and tools
- 🎨 **Modern UI**: Next.js 16 + React 19 with Tailwind CSS

## Architecture

```
agent-customise/
├── apps/
│   └── api/              # NestJS REST API server
├── packages/
│   ├── shared/           # Core types, errors, utilities
│   ├── config/           # Configuration with Zod validation
│   ├── planner/          # Plan generation and execution
│   ├── router/           # Agent routing logic
│   └── providers/        # Provider adapters
│       ├── openai/
│       ├── openrouter/
│       └── anthropic/
├── prisma/               # Database schema and migrations
└── config/               # Agent configuration
```

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Quick Start

### 1. Install dependencies

```bash
pnpm install
cd apps/web && npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env with your OpenRouter API key
```

### 3. Setup database

```bash
npx prisma migrate dev
```

### 4. Build packages

```bash
pnpm -r build
```

### 5. Start services

**Terminal 1 - API Server (Port 3030):**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Web UI (Port 3031):**
```bash
cd apps/web
npm run dev
```

### 6. Access Applications

- 🌐 **Web UI**: <http://localhost:3031>
- 🔌 **API**: <http://localhost:3030>
- 📊 **Health Check**: <http://localhost:3030/health>
- ⚙️ **MCP Config**: <http://localhost:3031/mcp>

## MCP Configuration

The system includes a full-featured **Model Context Protocol (MCP)** configuration interface for managing MCP servers and tools.

### Features

- 🔧 **Server Management**: Create, edit, enable/disable MCP servers
- 🛠️ **Tool Management**: Configure tools for each server
- ⚙️ **Settings**: Global MCP configuration
- 📝 **Environment Variables**: Configure server-specific env vars
- 🎛️ **Real-time Control**: Enable/disable servers without restart
- 🕐 **Sample Time Server**: Built-in MCP server for time/timezone operations
- 🤖 **Chat Integration**: Agents automatically use MCP tools when needed

### Quick Start

1. **Build Time Server** (sample MCP server):
   ```bash
   pnpm build:time
   ```

2. **Seed Sample Data** (includes Time Server + integration):
   ```bash
   pnpm seed:mcp
   ```

3. **Start API & Test Integration**:
   ```bash
   cd apps/api && PORT=3002 pnpm dev
   # In another terminal:
   ./test-time-integration.sh
   ```

4. **Access MCP Config UI**: <http://localhost:3031/mcp>
5. **Add a Server**: Click "Add Server" button
6. **Configure Server**:
   - Name: Display name (e.g., "Filesystem Server")
   - Command: Executable (e.g., `npx`)
   - Arguments: Comma-separated args (e.g., `-y, @modelcontextprotocol/server-filesystem, /path`)
   - Environment: Key=value pairs (e.g., `API_KEY=xxx`)
7. **Enable Server**: Toggle the enabled switch
8. **Manage Tools**: Add tools specific to each server

### Chat Integration with MCP Tools

**Agents now automatically use MCP tools!** When you ask time-related questions, agents will:
- 🔍 Detect tool needs from your question
- 🔧 Execute appropriate MCP tools (e.g., Time Server)
- 💬 Format results into natural language responses

**Example Conversation:**
```
User: "Mấy giờ rồi ở Việt Nam?"
Agent: [Internally uses Time Server's get_current_time tool]
Agent: "Bây giờ là 5:30 chiều, thứ Ba ngày 5 tháng 11 năm 2025 (GMT+7)"
```

**Test Integration:**
```bash
# Quick test (automated)
./test-time-integration.sh

# Manual test
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{"input":"What time is it?"}'
```

See [MCP Integration Guide](./.docs/mcp-chat-integration.md) for complete documentation.

### Sample Time Server

A built-in MCP server providing time/timezone information to agents:

**Available Tools:**
- `get_current_time`: Get current date/time in multiple formats
- `get_timestamp`: Get Unix timestamp
- `get_timezone`: Get timezone information
- `format_time`: Format timestamp to readable string

**Quick Test:**
```bash
# Build Time Server
pnpm build:time

# Test all tools manually
pnpm test:time

# Test chat integration
./test-time-integration.sh
```

**Documentation:**
- 📘 [Time Server Guide](./.docs/time-server-guide.md) - Tool documentation
- 🔗 [Integration Guide](./.docs/mcp-chat-integration.md) - Chat integration (500+ lines)
- 🚀 [Quick Start](./QUICKSTART-TIME-INTEGRATION.md) - Testing guide
- ✅ [Integration Summary](./MCP-INTEGRATION-DONE.md) - What's complete

### Example MCP Servers

**Time Server (Built-in Sample):**
```json
{
  "name": "Time Server",
  "command": "node",
  "args": ["packages/mcp-servers/time-server/dist/index.js"],
  "enabled": true,
  "description": "Provides current time and timezone information"
}
```

**Filesystem Server:**
```json
{
  "name": "Filesystem MCP Server",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
  "enabled": true
}
```

**Memory Server:**
```json
{
  "name": "Memory MCP Server",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"],
  "enabled": true,
  "description": "Persistent memory across conversations"
}
```

### MCP Resources

- 📘 [MCP Quickstart](./MCP-QUICKSTART.md) - Vietnamese guide
- 🕐 [Time Server Guide](./.docs/time-server-guide.md) - Sample server documentation
- 📖 [Full MCP Guide](./.docs/mcp-configuration-guide.md) - Complete documentation
- 📝 [Setup Summary](./MCP-SETUP-COMPLETE.md) - Complete feature list

See [MCP-QUICKSTART.md](./MCP-QUICKSTART.md) for detailed guide.

## API Endpoints

### Chat Endpoints

**POST /chat**
```json
{
  "input": "What is TypeScript?",
  "agentId": "generalist-gpt"  // optional
}
```

**GET /chat/stream**
- Server-Sent Events (SSE) for streaming responses

### Planner Endpoints

**POST /planner/plan-execute**
```json
{
  "goal": "Research and summarize the latest AI trends"
}
```

**POST /planner/plan**
- Generate plan only without execution

**GET /planner/runs**
- List all execution runs (pagination supported)

**GET /planner/runs/:id**
- Get details of specific run

### Health Check

**GET /health**
- Check server status

## Configuration

Edit `config/agent.config.json` to configure:

- **Providers**: Add/remove AI providers
- **Models**: Configure models and fallbacks
- **Agents**: Define agents with capabilities and system prompts
- **Routing**: Set routing rules and fallback logic
- **Planner**: Configure execution limits and parallelism

Example:
```json
{
  "providers": [
    {
      "id": "openai",
      "type": "openai",
      "apiKeyEnv": "OPENAI_API_KEY"
    }
  ],
  "models": [
    {
      "id": "gpt-4o",
      "provider": "openai",
      "name": "gpt-4o",
      "maxTokens": 4096
    }
  ],
  "agents": [
    {
      "id": "generalist-gpt",
      "modelId": "gpt-4o",
      "roles": ["general", "tech"],
      "capabilities": ["reasoning", "coding"],
      "systemPrompt": "You are a helpful AI assistant.",
      "tools": []
    }
  ]
}
```

## Development

### Build all packages
```bash
pnpm -r build
```

### Build specific package
```bash
cd packages/planner
pnpm build
```

### Run tests (coming soon)
```bash
pnpm test
```

## Project Structure

### Packages

- **@agent/shared**: Core types, interfaces, and utilities
- **@agent/config**: Configuration loading and validation
- **@agent/planner**: Plan generation and linear executor
- **@agent/router**: Hybrid routing (rule + LLM)
- **@agent/providers-{openai,anthropic,openrouter}**: Provider adapters

### Apps

- **@agent/apps-api**: NestJS REST API with SSE support

## Error Handling

The system uses standardized error codes and responses:

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent 'xyz' not found",
    "details": { "agentId": "xyz" }
  },
  "timestamp": "2025-11-04T...",
  "path": "/chat"
}
```

## Production Deployment

### Environment Variables

Set in production:
- `NODE_ENV=production`
- `DATABASE_URL`: PostgreSQL connection string
- Provider API keys
- `PORT`: Server port (default: 3000)

### Database Migration

```bash
npx prisma migrate deploy
```

### Build and Start

```bash
pnpm -r build
cd apps/api
node dist/main.js
```

## Contributing

1. Create feature branch
2. Make changes with tests
3. Build and verify: `pnpm -r build`
4. Submit PR

## License

MIT
