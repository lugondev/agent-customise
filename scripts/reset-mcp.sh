#!/usr/bin/env bash

# Reset MCP Database Script
# Clears all MCP data from database

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  WARNING: This will delete all MCP data!${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (yes/no)${NC}"
read -r response

if [[ "$response" != "yes" ]]; then
    echo -e "${GREEN}Cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}🗑️  Resetting MCP database...${NC}\n"

# Delete all MCP records using SQL
pnpm prisma db execute --stdin <<EOF
DELETE FROM mcp_settings;
DELETE FROM mcp_tools;
DELETE FROM mcp_servers;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MCP database reset successfully!${NC}\n"
    
    echo -e "${YELLOW}Would you like to seed sample data? (y/n)${NC}"
    read -r seed_response
    
    if [[ "$seed_response" =~ ^[Yy]$ ]]; then
        pnpm seed:mcp
        echo -e "${GREEN}✅ Sample data seeded${NC}"
    fi
else
    echo -e "${RED}❌ Failed to reset database${NC}"
    exit 1
fi
