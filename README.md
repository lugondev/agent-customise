# Agent Customise - Multi-Agent AI System

A TypeScript-first multi-agent AI orchestration platform with intelligent routing, plan execution, and multi-provider support.

## Features

- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter
- 🧠 **Intelligent Routing**: Rule-based + LLM routing for agent selection
- 📋 **Plan Execution**: Generate and execute multi-step plans with dependency resolution
- 💾 **Persistence**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- 🔄 **Retry Logic**: Exponential backoff with circuit breaker pattern
- 🛡️ **Error Handling**: Production-ready error responses and logging
- 🔌 **Extensible**: Easy to add new providers, agents, and tools

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

- 🌐 **Web UI**: http://localhost:3031
- 🔌 **API**: http://localhost:3030
- 📊 **Health Check**: http://localhost:3030/health

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
