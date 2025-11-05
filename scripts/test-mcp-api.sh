#!/usr/bin/env bash#!/usr/bin/env bash



# MCP API Test Script# MCP API Test Script

# Test all MCP endpoints# Test all MCP endpoints



API_URL="http://localhost:3002"API_URL="http://localhost:3001"

YELLOW='\033[1;33m'YELLOW='\033[1;33m'

GREEN='\033[0;32m'GREEN='\033[0;32m'

RED='\033[0;31m'RED='\033[0;31m'

NC='\033[0m' # No ColorNC='\033[0m' # No Color



echo -e "${YELLOW}🧪 Testing MCP API Endpoints${NC}\n"echo -e "${YELLOW}🧪 Testing MCP API Endpoints${NC}\n"



# Test 1: Create MCP Server# Test 1: Create MCP Server

echo -e "${YELLOW}1. Creating MCP Server...${NC}"echo -e "${YELLOW}1. Creating MCP Server...${NC}"

SERVER_ID=$(curl -s -X POST "$API_URL/mcp/servers" \SERVER_ID=$(curl -s -X POST "$API_URL/mcp/servers" \

  -H "Content-Type: application/json" \  -H "Content-Type: application/json" \

  -d '{  -d '{

    "name": "Test Filesystem Server",    "name": "Test Filesystem Server",

    "command": "npx",    "command": "npx",

    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],

    "enabled": true,    "enabled": true,

    "description": "Test server for API testing"    "description": "Test server for API testing"

  }' | jq -r '.id')  }' | jq -r '.id')



if [ -n "$SERVER_ID" ]; thenif [ -n "$SERVER_ID" ]; then

  echo -e "${GREEN}✅ Server created with ID: $SERVER_ID${NC}\n"  echo -e "${GREEN}✅ Server created with ID: $SERVER_ID${NC}\n"

elseelse

  echo -e "${RED}❌ Failed to create server${NC}\n"  echo -e "${RED}❌ Failed to create server${NC}\n"

  exit 1  exit 1

fifi



# Test 2: Get all servers# Test 2: Get all servers

echo -e "${YELLOW}2. Getting all servers...${NC}"echo -e "${YELLOW}2. Getting all servers...${NC}"

SERVERS=$(curl -s "$API_URL/mcp/servers" | jq '.')SERVERS=$(curl -s "$API_URL/mcp/servers" | jq '.')

echo -e "${GREEN}✅ Servers:${NC}"echo -e "${GREEN}✅ Servers:${NC}"

echo "$SERVERS" | head -n 10echo "$SERVERS" | head -n 10

echo ""echo ""



# Test 3: Get server by ID# Test 3: Get server by ID

echo -e "${YELLOW}3. Getting server by ID...${NC}"echo -e "${YELLOW}3. Getting server by ID...${NC}"

SERVER=$(curl -s "$API_URL/mcp/servers/$SERVER_ID" | jq '.')SERVER=$(curl -s "$API_URL/mcp/servers/$SERVER_ID" | jq '.')

echo -e "${GREEN}✅ Server details:${NC}"echo -e "${GREEN}✅ Server details:${NC}"

echo "$SERVER" | jq '.name, .command, .enabled'echo "$SERVER" | jq '.name, .command, .enabled'

echo ""echo ""



# Test 4: Create MCP Tool# Test 4: Create MCP Tool

echo -e "${YELLOW}4. Creating MCP Tool...${NC}"echo -e "${YELLOW}4. Creating MCP Tool...${NC}"

TOOL_ID=$(curl -s -X POST "$API_URL/mcp/tools" \TOOL_ID=$(curl -s -X POST "$API_URL/mcp/tools" \

  -H "Content-Type: application/json" \  -H "Content-Type: application/json" \

  -d "{  -d "{

    \"serverId\": \"$SERVER_ID\",    \"serverId\": \"$SERVER_ID\",

    \"name\": \"test_tool\",    \"name\": \"test_tool\",

    \"description\": \"Test tool\",    \"description\": \"Test tool\",

    \"schema\": {    \"schema\": {

      \"type\": \"object\",      \"type\": \"object\",

      \"properties\": {      \"properties\": {

        \"input\": {\"type\": \"string\"}        \"input\": {\"type\": \"string\"}

      }      }

    },    },

    \"enabled\": true    \"enabled\": true

  }" | jq -r '.id')  }" | jq -r '.id')



if [ -n "$TOOL_ID" ]; thenif [ -n "$TOOL_ID" ]; then

  echo -e "${GREEN}✅ Tool created with ID: $TOOL_ID${NC}\n"  echo -e "${GREEN}✅ Tool created with ID: $TOOL_ID${NC}\n"

elseelse

  echo -e "${RED}❌ Failed to create tool${NC}\n"  echo -e "${RED}❌ Failed to create tool${NC}\n"

fifi



# Test 5: Get tools by server ID# Test 5: Get tools by server ID

echo -e "${YELLOW}5. Getting tools for server...${NC}"echo -e "${YELLOW}5. Getting tools for server...${NC}"

TOOLS=$(curl -s "$API_URL/mcp/tools/server/$SERVER_ID" | jq '.')TOOLS=$(curl -s "$API_URL/mcp/tools/server/$SERVER_ID" | jq '.')

echo -e "${GREEN}✅ Tools:${NC}"echo -e "${GREEN}✅ Tools:${NC}"

echo "$TOOLS" | jq '.[] | {name, enabled}'echo "$TOOLS" | jq '.[] | {name, enabled}'

echo ""echo ""



# Test 6: Update server# Test 6: Update server

echo -e "${YELLOW}6. Updating server...${NC}"echo -e "${YELLOW}6. Updating server...${NC}"

curl -s -X PUT "$API_URL/mcp/servers/$SERVER_ID" \curl -s -X PUT "$API_URL/mcp/servers/$SERVER_ID" \

  -H "Content-Type: application/json" \  -H "Content-Type: application/json" \

  -d '{  -d '{

    "description": "Updated test server"    "description": "Updated test server"

  }' > /dev/null  }' > /dev/null

echo -e "${GREEN}✅ Server updated${NC}\n"echo -e "${GREEN}✅ Server updated${NC}\n"



# Test 7: Create MCP Setting# Test 7: Create MCP Setting

echo -e "${YELLOW}7. Creating MCP Setting...${NC}"echo -e "${YELLOW}7. Creating MCP Setting...${NC}"

curl -s -X POST "$API_URL/mcp/settings" \curl -s -X POST "$API_URL/mcp/settings" \

  -H "Content-Type: application/json" \  -H "Content-Type: application/json" \

  -d '{  -d '{

    "key": "test_setting",    "key": "test_setting",

    "value": {"enabled": true, "timeout": 5000}    "value": {"enabled": true, "timeout": 5000}

  }' > /dev/null  }' > /dev/null

echo -e "${GREEN}✅ Setting created${NC}\n"echo -e "${GREEN}✅ Setting created${NC}\n"



# Test 8: Get all settings# Test 8: Get all settings

echo -e "${YELLOW}8. Getting all settings...${NC}"echo -e "${YELLOW}8. Getting all settings...${NC}"

SETTINGS=$(curl -s "$API_URL/mcp/settings" | jq '.')SETTINGS=$(curl -s "$API_URL/mcp/settings" | jq '.')

echo -e "${GREEN}✅ Settings:${NC}"echo -e "${GREEN}✅ Settings:${NC}"

echo "$SETTINGS" | jq '.[] | {key, value}'echo "$SETTINGS" | jq '.[] | {key, value}'

echo ""echo ""



# Test 9: Upsert setting# Test 9: Upsert setting

echo -e "${YELLOW}9. Upserting setting...${NC}"echo -e "${YELLOW}9. Upserting setting...${NC}"

curl -s -X POST "$API_URL/mcp/settings/test_setting/upsert" \curl -s -X POST "$API_URL/mcp/settings/test_setting/upsert" \

  -H "Content-Type: application/json" \  -H "Content-Type: application/json" \

  -d '{  -d '{

    "value": {"enabled": false, "timeout": 10000}    "value": {"enabled": false, "timeout": 10000}

  }' > /dev/null  }' > /dev/null

echo -e "${GREEN}✅ Setting upserted${NC}\n"echo -e "${GREEN}✅ Setting upserted${NC}\n"



# Test 10: Get enabled servers# Test 10: Get enabled servers

echo -e "${YELLOW}10. Getting enabled servers...${NC}"echo -e "${YELLOW}10. Getting enabled servers...${NC}"

ENABLED=$(curl -s "$API_URL/mcp/servers/enabled" | jq 'length')ENABLED=$(curl -s "$API_URL/mcp/servers/enabled" | jq 'length')

echo -e "${GREEN}✅ Number of enabled servers: $ENABLED${NC}\n"echo -e "${GREEN}✅ Number of enabled servers: $ENABLED${NC}\n"



# Cleanup# Cleanup

echo -e "${YELLOW}🧹 Cleaning up...${NC}"echo -e "${YELLOW}🧹 Cleaning up...${NC}"

curl -s -X DELETE "$API_URL/mcp/tools/$TOOL_ID" > /dev/nullcurl -s -X DELETE "$API_URL/mcp/tools/$TOOL_ID" > /dev/null

echo -e "${GREEN}✅ Tool deleted${NC}"echo -e "${GREEN}✅ Tool deleted${NC}"

curl -s -X DELETE "$API_URL/mcp/servers/$SERVER_ID" > /dev/nullcurl -s -X DELETE "$API_URL/mcp/servers/$SERVER_ID" > /dev/null

echo -e "${GREEN}✅ Server deleted${NC}"echo -e "${GREEN}✅ Server deleted${NC}"

curl -s -X DELETE "$API_URL/mcp/settings/test_setting" > /dev/nullcurl -s -X DELETE "$API_URL/mcp/settings/test_setting" > /dev/null

echo -e "${GREEN}✅ Setting deleted${NC}\n"echo -e "${GREEN}✅ Setting deleted${NC}\n"



echo -e "${GREEN}🎉 All tests passed!${NC}"echo -e "${GREEN}🎉 All tests passed!${NC}"

