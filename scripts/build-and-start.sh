#!/bin/bash

# Complete Build and Start Script
# Checks Docker, builds, and starts all services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Complete Build & Start${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Docker
echo -e "${BLUE}Step 1: Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}\n"
    echo -e "${YELLOW}Please start Docker Desktop first:${NC}"
    echo -e "  1. Open Docker Desktop application"
    echo -e "  2. Wait for Docker to start"
    echo -e "  3. Run this script again\n"
    
    # Try to open Docker Desktop (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}Attempting to open Docker Desktop...${NC}"
        open -a Docker 2>/dev/null || true
        echo -e "${YELLOW}Waiting 10 seconds for Docker to start...${NC}"
        sleep 10
        
        # Check again
        if docker ps > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker started!${NC}\n"
        else
            echo -e "${RED}❌ Docker still not running. Please start manually.${NC}\n"
            exit 1
        fi
    else
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker is running${NC}\n"
fi

# Check configuration
echo -e "${BLUE}Step 2: Checking configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Running configuration...${NC}\n"
    ./scripts/configure-supabase.sh
fi
echo -e "${GREEN}✅ Configuration ready${NC}\n"

# Build services
echo -e "${BLUE}Step 3: Building services...${NC}\n"

echo -e "${BLUE}Building infrastructure (postgres, redis)...${NC}"
docker-compose build postgres redis || {
    echo -e "${RED}✗ Infrastructure build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Infrastructure built${NC}\n"

echo -e "${BLUE}Building API...${NC}"
docker-compose build api || {
    echo -e "${RED}✗ API build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ API built${NC}\n"

echo -e "${BLUE}Building frontend services...${NC}"
docker-compose build explorer landing nex-exchange wallet || {
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Frontend services built${NC}\n"

# Start services
echo -e "${BLUE}Step 4: Starting services...${NC}\n"
./scripts/start-services.sh

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Build and Start Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}All services are running! 🚀${NC}\n"

