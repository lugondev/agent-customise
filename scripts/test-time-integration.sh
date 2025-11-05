#!/bin/bash

# Test Time Server Integration with Chat Interface
# This script tests the complete flow: User -> Chat -> LLM -> MCP Tool -> Response

set -e

API_URL="http://localhost:3002"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Testing Time Server Chat Integration${NC}"
echo -e "${YELLOW}======================================${NC}\n"

# Function to test API endpoint
test_chat() {
  local input="$1"
  local description="$2"
  
  echo -e "\n${YELLOW}Test: ${description}${NC}"
  echo -e "Input: ${input}\n"
  
  response=$(curl -s -X POST "${API_URL}/chat" \
    -H "Content-Type: application/json" \
    -d "{\"input\":\"${input}\"}")
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API Response:${NC}"
    echo "$response" | jq .
  else
    echo -e "${RED}✗ Request failed${NC}"
    return 1
  fi
}

# Check if API is running
echo -e "${YELLOW}Checking if API is running...${NC}"
if curl -s "${API_URL}/health" > /dev/null; then
  echo -e "${GREEN}✓ API is running${NC}\n"
else
  echo -e "${RED}✗ API is not running${NC}"
  echo -e "Please start the API first:"
  echo -e "  cd apps/api && PORT=3002 pnpm dev\n"
  exit 1
fi

# Test 1: Vietnamese time query
test_chat "Mấy giờ rồi?" "Vietnamese time query (should use get_current_time tool)"

# Test 2: English time query
test_chat "What time is it?" "English time query (should use get_current_time tool)"

# Test 3: Specific timezone
test_chat "What time is it in New York?" "Timezone-specific query (should use get_current_time with timezone)"

# Test 4: Unix timestamp
test_chat "Give me the current Unix timestamp" "Timestamp query (should use get_timestamp tool)"

# Test 5: Timezone info
test_chat "What timezone am I in?" "Timezone query (should use get_timezone tool)"

# Test 6: General chat (no tool needed)
test_chat "Hello, how are you?" "General conversation (should NOT use any tool)"

# Test 7: Vietnamese timezone query
test_chat "Bây giờ là mấy giờ ở Việt Nam?" "Vietnamese timezone query (should use get_current_time with Asia/Ho_Chi_Minh)"

# Test 8: Timestamp formatting
test_chat "Format this timestamp: 1730805045123" "Timestamp formatting (should use format_time tool)"

echo -e "\n${YELLOW}======================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${YELLOW}======================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the responses above"
echo -e "2. Check if tools were used appropriately"
echo -e "3. Verify natural language responses"
echo -e "4. Check API logs for tool execution details\n"
