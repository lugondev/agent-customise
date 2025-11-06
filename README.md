# Agent Customise - Multi-Agent AI System

A TypeScript-first multi-agent AI orchestration platform with intelligent routing, plan execution, and multi-provider support.

## Features

### Core Features
- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter with seamless provider switching
- 🧠 **Intelligent Routing**: Hybrid rule-based + LLM routing for optimal agent selection
- 📋 **Plan Execution**: Multi-step plan generation with dependency resolution and parallel execution
- 🔧 **MCP Integration**: Full Model Context Protocol server & tool management with chat integration
- 💾 **Persistence**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- 🔄 **Resilience**: Exponential backoff, circuit breaker pattern, and automatic retries
- 🛡️ **Error Handling**: Production-ready error responses with standardized codes
- 🔌 **Extensible**: Modular architecture for adding providers, agents, and tools

### Frontend Features
- 🎨 **Modern UI**: Next.js 16 App Router + React 19 with Server Components
- 🌓 **Dark Mode**: System-aware dark/light theme with smooth transitions (next-themes)
- 💬 **Real-time Chat**: Interactive chat interface with streaming responses
- 📊 **Model Stats**: Real-time model usage statistics and performance metrics
- ⚙️ **MCP Manager**: Visual interface for configuring MCP servers and tools
- 🎯 **Agent Selector**: Dynamic agent selection with capability display
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Optimized Performance**: Server-side rendering and client-side hydration

## Architecture

```text
agent-customise/
├── apps/
│   ├── api/              # NestJS REST API server (Port 3030)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── chat/      # Chat endpoints with streaming
│   │   │   │   ├── planner/   # Plan generation & execution
│   │   │   │   ├── mcp/       # MCP server management
│   │   │   │   └── health/    # Health check endpoints
│   │   │   └── filters/       # Global exception handling
│   └── web/              # Next.js 16 + React 19 UI (Port 3031)
│       ├── app/
│       │   ├── page.tsx       # Chat interface (Server Component)
│       │   ├── layout.tsx     # Root layout with theme provider
│       │   ├── mcp/           # MCP configuration page
│       │   └── api/chat/      # API route handlers
│       ├── components/
│       │   ├── chat-interface.tsx        # Main chat UI
│       │   ├── agent-selector.tsx        # Agent selection dropdown
│       │   ├── model-stats.tsx           # Usage statistics
│       │   ├── mcp-servers-manager.tsx   # MCP server config
│       │   ├── theme-toggle.tsx          # Dark/light mode toggle
│       │   └── ui/                       # Reusable UI components
│       └── lib/
│           ├── api/           # API client services
│           └── utils.ts       # Utility functions
├── packages/
│   ├── shared/           # Core types, errors, utilities, model bus
│   ├── config/           # Configuration with Zod validation
│   ├── planner/          # Plan generation and linear execution
│   ├── router/           # Hybrid routing (rule + LLM)
│   ├── providers/        # Provider adapters
│   │   ├── openai/       # OpenAI provider
│   │   ├── openrouter/   # OpenRouter provider
│   │   └── anthropic/    # Anthropic provider
│   └── mcp-servers/      # MCP server implementations
│       └── time-server/  # Built-in time/timezone server
├── prisma/               # Database schema and migrations
├── config/               # Agent & MCP configuration files
└── scripts/              # Setup and testing scripts
```

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: Prisma ORM (SQLite dev / PostgreSQL prod)
- **API**: REST + Server-Sent Events (SSE) for streaming
- **Architecture**: Modular monorepo with dependency injection

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with Server Components
- **Styling**: Tailwind CSS with custom design system
- **Theme**: next-themes for dark/light mode
- **Components**: Radix UI primitives with custom styling
- **State**: React hooks and Server Actions
- **Package Manager**: pnpm with workspaces

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env with your API keys:
# - OPENROUTER_API_KEY (required for OpenRouter)
# - OPENAI_API_KEY (optional)
# - ANTHROPIC_API_KEY (optional)
```

### 3. Setup database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Build packages

```bash
pnpm -r build
```

### 5. Start development servers

**Option A: Start all services**

```bash
pnpm dev
```

**Option B: Start individually**

Terminal 1 - API Server:

```bash
pnpm dev:api
# Runs on http://localhost:3030
```

Terminal 2 - Web UI:

```bash
pnpm dev:web
# Runs on http://localhost:3031
```

### 6. Access applications

- 🌐 **Web UI**: <http://localhost:3031> - Chat interface with dark mode
- � **MCP Config**: <http://localhost:3031/mcp> - MCP server management
- � **API**: <http://localhost:3030> - REST API endpoints
- 💚 **Health Check**: <http://localhost:3030/health> - Server health status

## MCP Configuration

The system includes a full-featured **Model Context Protocol (MCP)** configuration interface for managing MCP servers and tools.

### MCP Features

- 🔧 **Server Management**: Create, edit, enable/disable MCP servers
- 🛠️ **Tool Management**: Configure tools for each server
- ⚙️ **Settings**: Global MCP configuration
- 📝 **Environment Variables**: Configure server-specific env vars
- 🎛️ **Real-time Control**: Enable/disable servers without restart
- 🕐 **Sample Time Server**: Built-in MCP server for time/timezone operations
- 🤖 **Chat Integration**: Agents automatically use MCP tools when needed

### MCP Quick Start

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
   ./scripts/test-time-integration.sh
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

```text
User: "Mấy giờ rồi ở Việt Nam?"
Agent: [Internally uses Time Server's get_current_time tool]
Agent: "Bây giờ là 5:30 chiều, thứ Ba ngày 5 tháng 11 năm 2025 (GMT+7)"
```

**Test Integration:**

```bash
# Quick test (automated)
./scripts/test-time-integration.sh

# Manual test
curl -X POST http://localhost:3030/chat \
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
./scripts/test-time-integration.sh
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

#### POST /chat

```json
{
  "input": "What is TypeScript?",
  "agentId": "generalist-gpt"  // optional
}
```

#### GET /chat/stream

Server-Sent Events (SSE) for streaming responses

### Planner Endpoints

#### POST /planner/plan-execute

```json
{
  "goal": "Research and summarize the latest AI trends"
}
```

#### POST /planner/plan

Generate plan only without execution

#### GET /planner/runs

List all execution runs (pagination supported)

#### GET /planner/runs/:id

Get details of specific run

### Health Check

#### GET /health

Check server status

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

### Run tests

```bash
pnpm test
```

### Development scripts

```bash
# Start API server in development
pnpm dev:api

# Start web UI in development
pnpm dev:web

# Start both services
pnpm dev

# Build Time Server
pnpm build:time

# Test Time Server
pnpm test:time

# Seed MCP data
pnpm seed:mcp
```

## Project Structure

### Packages

- **@agent/shared**: Core types, interfaces, utilities, and model bus
- **@agent/config**: Configuration loading and Zod validation
- **@agent/planner**: Plan generation and linear executor with dependency resolution
- **@agent/router**: Hybrid routing (rule-based + LLM)
- **@agent/providers-{openai,anthropic,openrouter}**: Provider adapters with unified interface

### Apps

- **@agent/apps-api**: NestJS REST API with SSE support, modular architecture
- **@agent/apps-web**: Next.js 16 web UI with React 19 and dark mode

### MCP Servers

- **@agent/mcp-servers-time-server**: Built-in time/timezone MCP server

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
  "timestamp": "2025-11-06T...",
  "path": "/chat"
}
```

Common error codes:

- `AGENT_NOT_FOUND`: Requested agent doesn't exist
- `MODEL_NOT_FOUND`: Requested model not configured
- `PROVIDER_ERROR`: Provider API error
- `VALIDATION_ERROR`: Invalid request data
- `EXECUTION_ERROR`: Plan execution failed

## Production Deployment

### Environment Variables

Set in production:

- `NODE_ENV=production`
- `DATABASE_URL`: PostgreSQL connection string
- Provider API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`)
- `PORT`: Server port (default: 3030)
- `FRONTEND_URL`: Web UI URL for CORS

### Database Migration

```bash
npx prisma migrate deploy
```

### Build and Start

```bash
# Build all packages
pnpm -r build

# Start API server
cd apps/api
node dist/main.js

# Build and start web UI
cd apps/web
pnpm build
pnpm start
```

### Docker Deployment (Coming Soon)

```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper TypeScript types
4. Build and verify: `pnpm -r build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## License

MIT

## Support

For issues and questions:

- 📖 Check the [documentation](./.docs/)
- 🐛 Report bugs via GitHub Issues
- 💬 Join discussions in GitHub Discussions

---

Built with ❤️ using TypeScript, NestJS, Next.js, and React
