#!/bin/bash

# Check Docker Status and Start if Needed

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking Docker status...${NC}\n"

# Check if Docker is running
if docker ps > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is running!${NC}\n"
    exit 0
else
    echo -e "${RED}❌ Docker is not running${NC}\n"
    echo -e "${YELLOW}Please start Docker Desktop:${NC}"
    echo -e "  1. Open Docker Desktop application"
    echo -e "  2. Wait for Docker to start (whale icon in menu bar)"
    echo -e "  3. Run this script again: ${GREEN}./scripts/check-docker.sh${NC}\n"
    
    # Try to open Docker Desktop (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}Attempting to open Docker Desktop...${NC}"
        open -a Docker 2>/dev/null || echo -e "${YELLOW}Could not auto-open Docker Desktop${NC}"
    fi
    
    exit 1
fi

