#!/bin/bash

# Start NorChain Services
# Starts all services with proper dependency order

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting NorChain Services${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "  Run: ./scripts/configure-supabase.sh"
    exit 1
fi

# Step 1: Start Infrastructure
echo -e "${BLUE}Step 1: Starting Infrastructure...${NC}"
docker-compose up -d postgres redis
echo -e "${GREEN}✓ Infrastructure started${NC}\n"

# Wait for infrastructure to be ready
echo -e "${BLUE}Waiting for infrastructure to be ready...${NC}"
sleep 10

# Step 2: Start API
echo -e "${BLUE}Step 2: Starting API...${NC}"
docker-compose up -d api
echo -e "${GREEN}✓ API started${NC}\n"

# Wait for API to be ready
echo -e "${BLUE}Waiting for API to be ready...${NC}"
sleep 15

# Step 3: Start Frontend Services
echo -e "${BLUE}Step 3: Starting Frontend Services...${NC}"
docker-compose up -d explorer landing nex-exchange wallet
echo -e "${GREEN}✓ Frontend services started${NC}\n"

# Step 4: Check Status
echo -e "${BLUE}Step 4: Checking Service Status...${NC}"
docker-compose ps

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ All Services Started!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Service URLs:${NC}"
echo -e "  - API: ${GREEN}http://localhost:4000${NC}"
echo -e "  - API Docs: ${GREEN}http://localhost:4000/api-docs${NC}"
echo -e "  - Explorer: ${GREEN}http://localhost:4002${NC}"
echo -e "  - Landing: ${GREEN}http://localhost:4010${NC}"
echo -e "  - Wallet: ${GREEN}http://localhost:4020${NC}"
echo -e "  - NEX Exchange: ${GREEN}http://localhost:4011${NC}\n"

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  - View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "  - Stop services: ${GREEN}docker-compose down${NC}"
echo -e "  - Restart service: ${GREEN}docker-compose restart <service>${NC}"
echo -e "\n${GREEN}Services are running! 🚀${NC}"

