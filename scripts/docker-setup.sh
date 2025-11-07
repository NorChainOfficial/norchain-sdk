#!/bin/bash

# Complete Docker Environment Setup Script
# Sets up, builds, and starts the entire NorChain ecosystem

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Docker Environment Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check prerequisites
echo -e "${BLUE}=== Checking Prerequisites ===${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    exit 1
fi
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Load environment
export $(cat .env | grep -v '^#' | xargs)

# Stop existing containers
echo -e "${BLUE}=== Stopping Existing Containers ===${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Stopped existing containers${NC}\n"

# Build images
echo -e "${BLUE}=== Building Docker Images ===${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}\n"
docker-compose build --parallel
echo -e "${GREEN}✓ Images built successfully${NC}\n"

# Start services
echo -e "${BLUE}=== Starting Services ===${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}\n"

# Wait for services to be ready
echo -e "${BLUE}=== Waiting for Services to be Ready ===${NC}"
echo -e "${YELLOW}Waiting 30 seconds for services to initialize...${NC}"
sleep 30
echo ""

# Run verification
echo -e "${BLUE}=== Running Verification ===${NC}"
if [ -f scripts/docker-verify.sh ]; then
    ./scripts/docker-verify.sh
else
    echo -e "${YELLOW}⚠ Verification script not found${NC}"
fi
echo ""

# Run tests
echo -e "${BLUE}=== Running Tests ===${NC}"
if [ -f scripts/docker-test.sh ]; then
    ./scripts/docker-test.sh || true
else
    echo -e "${YELLOW}⚠ Test script not found${NC}"
fi
echo ""

# Display service URLs
echo -e "${BLUE}=== Service URLs ===${NC}"
API_PORT=${API_PORT:-4000}
EXPLORER_APP_PORT=${EXPLORER_APP_PORT:-4002}
LANDING_PORT=${LANDING_PORT:-4010}
DOCS_PORT=${DOCS_PORT:-4011}
NEX_EXCHANGE_PORT=${NEX_EXCHANGE_PORT:-4001}
WALLET_PORT=${WALLET_PORT:-4020}

echo -e "Unified API:        ${GREEN}http://localhost:${API_PORT}${NC}"
echo -e "API Docs:           ${GREEN}http://localhost:${API_PORT}/api-docs${NC}"
echo -e "Explorer App:       ${GREEN}http://localhost:${EXPLORER_APP_PORT}${NC}"
echo -e "Landing Page:       ${GREEN}http://localhost:${LANDING_PORT}${NC}"
echo -e "Documentation:      ${GREEN}http://localhost:${DOCS_PORT}${NC}"
echo -e "NEX Exchange:       ${GREEN}http://localhost:${NEX_EXCHANGE_PORT}${NC}"
echo -e "Wallet Web:         ${GREEN}http://localhost:${WALLET_PORT}${NC}"
echo ""

echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "\nUseful commands:"
echo -e "  View logs:        ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop services:    ${YELLOW}docker-compose down${NC}"
echo -e "  Restart service:  ${YELLOW}docker-compose restart <service-name>${NC}"
echo -e "  Test connectivity: ${YELLOW}./scripts/test-connectivity.sh${NC}"

