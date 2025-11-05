#!/usr/bin/env bash

# Complete MCP Setup Script
# This script sets up everything needed for MCP configuration

set -e  # Exit on error

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MCP Configuration Setup Script               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}\n"

# Step 1: Check dependencies
echo -e "${YELLOW}📦 Step 1: Checking dependencies...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install it first: npm install -g pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}✅ pnpm found${NC}\n"

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 3: Build shared packages
echo -e "${YELLOW}🔨 Step 3: Building shared packages...${NC}"
cd packages/shared && pnpm build
cd ../..
echo -e "${GREEN}✅ Shared packages built${NC}\n"

# Step 4: Database setup
echo -e "${YELLOW}🗄️  Step 4: Setting up database...${NC}"
if [ ! -f "prisma/dev.db" ]; then
    echo "Creating new database..."
    pnpm prisma migrate dev --name init
else
    echo "Database exists, running migrations..."
    pnpm prisma migrate dev
fi
echo -e "${GREEN}✅ Database ready${NC}\n"

# Step 5: Seed MCP data (optional)
echo -e "${YELLOW}🌱 Step 5: Seed sample MCP data? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    pnpm seed:mcp
    echo -e "${GREEN}✅ Sample data seeded${NC}\n"
else
    echo -e "${BLUE}⏭️  Skipped seeding${NC}\n"
fi

# Step 6: Build API
echo -e "${YELLOW}🔨 Step 6: Building API...${NC}"
cd apps/api && pnpm build
cd ../..
echo -e "${GREEN}✅ API built${NC}\n"

# Step 7: Check environment files
echo -e "${YELLOW}⚙️  Step 7: Checking environment files...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your API keys${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env file found${NC}"
    fi
fi

if [ ! -f "apps/web/.env.local" ]; then
    if [ -f "apps/web/.env.example" ]; then
        echo -e "${YELLOW}Creating apps/web/.env.local from .env.example...${NC}"
        cp apps/web/.env.example apps/web/.env.local
    fi
fi
echo -e "${GREEN}✅ Environment files checked${NC}\n"

# Final instructions
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Setup Complete!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📋 Next Steps:${NC}\n"
echo -e "1. ${YELLOW}Start Backend API:${NC}"
echo -e "   ${GREEN}pnpm dev:api${NC}"
echo -e "   ${BLUE}API will run on: http://localhost:3002${NC}\n"

echo -e "2. ${YELLOW}Start Frontend (in another terminal):${NC}"
echo -e "   ${GREEN}pnpm dev:web${NC}"
echo -e "   ${BLUE}Web UI will run on: http://localhost:3032${NC}\n"

echo -e "3. ${YELLOW}Access MCP Configuration:${NC}"
echo -e "   ${BLUE}http://localhost:3032/mcp${NC}\n"

echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "   - Quick Start: ${GREEN}./MCP-QUICKSTART.md${NC}"
echo -e "   - Full Guide: ${GREEN}./.docs/mcp-configuration-guide.md${NC}"
echo -e "   - Examples: ${GREEN}./config/mcp.example.json${NC}\n"

echo -e "${YELLOW}🧪 Test API:${NC}"
echo -e "   ${GREEN}pnpm test:mcp${NC}\n"

echo -e "${GREEN}Happy coding! 🚀${NC}"
