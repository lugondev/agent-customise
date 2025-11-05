# Time Server - MCP Server

A Model Context Protocol (MCP) server that provides current time and timezone information to AI agents.

## Features

- **Get Current Time**: Retrieve current date/time in multiple formats (ISO, locale, UTC, date only, time only)
- **Get Timestamp**: Get Unix timestamps in seconds or milliseconds
- **Get Timezone**: Get information about the current timezone including offset and DST status
- **Format Time**: Format Unix timestamps to human-readable strings

## Installation

```bash
# From project root
cd packages/mcp-servers/time-server
pnpm install
pnpm build
```

## Usage

### As MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "time": {
      "command": "node",
      "args": ["/path/to/agent-customise/packages/mcp-servers/time-server/dist/index.js"]
    }
  }
}
```

Or use the built-in command:

```bash
npx @agent/mcp-time-server
```

### Standalone Testing

```bash
# Start the server
pnpm start

# The server communicates via stdio using MCP protocol
```

## Available Tools

### 1. get_current_time

Get the current date and time.

**Parameters:**
- `format` (optional): Output format - `iso`, `locale`, `utc`, `date`, `time` (default: `iso`)
- `timezone` (optional): IANA timezone name (e.g., `America/New_York`, `Asia/Ho_Chi_Minh`)

**Example Response:**
```json
{
  "time": "2025-11-05T10:30:45.123Z",
  "format": "iso",
  "timezone": "Asia/Ho_Chi_Minh",
  "timestamp": 1730805045123
}
```

### 2. get_timestamp

Get the current Unix timestamp.

**Parameters:**
- `unit` (optional): `seconds` or `milliseconds` (default: `milliseconds`)

**Example Response:**
```json
{
  "timestamp": 1730805045123,
  "unit": "milliseconds",
  "iso": "2025-11-05T10:30:45.123Z"
}
```

### 3. get_timezone

Get information about the current timezone.

**Parameters:** None

**Example Response:**
```json
{
  "timezone": "Asia/Ho_Chi_Minh",
  "offset": "+07:00",
  "offsetMinutes": 420,
  "isDST": false
}
```

### 4. format_time

Format a Unix timestamp to a readable string.

**Parameters:**
- `timestamp` (required): Unix timestamp in milliseconds
- `format` (optional): Output format - `iso`, `locale`, `utc`, `date`, `time` (default: `iso`)
- `timezone` (optional): IANA timezone name for formatting

**Example Response:**
```json
{
  "time": "Tuesday, November 5, 2025 at 5:30:45 PM GMT+7",
  "format": "locale",
  "timezone": "Asia/Ho_Chi_Minh",
  "inputTimestamp": 1730805045123
}
```

## Integration with Agent System

This MCP server can be registered in the agent system database:

```typescript
// Example: Add to database via API
const server = {
  name: 'Time Server',
  command: 'node',
  args: [
    '/Users/lugon/dev/2025-project-002/agent-customise/packages/mcp-servers/time-server/dist/index.js'
  ],
  enabled: true,
  description: 'Provides current time and timezone information to agents'
};

// Or use npx for portable installation
const portableServer = {
  name: 'Time Server',
  command: 'npx',
  args: ['-y', '@agent/mcp-time-server'],
  enabled: true,
  description: 'Provides current time and timezone information to agents'
};
```

## Use Cases

- **Time-aware agents**: Allow agents to know the current time for scheduling and time-based decisions
- **Timezone conversions**: Help agents understand time in different timezones
- **Logging and timestamps**: Provide accurate timestamps for agent actions
- **Date calculations**: Enable agents to work with dates and times

## Development

```bash
# Watch mode for development
pnpm dev

# Build
pnpm build

# Test (manual)
pnpm start
```

## Technical Details

- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio
- **Language**: TypeScript
- **Runtime**: Node.js 20+
- **SDK**: @modelcontextprotocol/sdk

## License

MIT
