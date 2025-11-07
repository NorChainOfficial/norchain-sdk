#!/bin/bash

# Build NorChain Monorepo with Supabase Configuration
# This script builds all services with Supabase integration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Build with Supabase${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Running configuration script...${NC}\n"
    ./scripts/configure-supabase.sh
fi

# Load environment variables
source .env 2>/dev/null || true

# Verify Supabase configuration
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}✗ Supabase configuration missing!${NC}"
    echo -e "  Please run: ./scripts/configure-supabase.sh"
    exit 1
fi

echo -e "${GREEN}✓ Supabase Configuration Found${NC}"
echo -e "  URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo -e "  Anon Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:50}...\n"

# Check for Service Role Key
if [ -z "$SUPABASE_SERVICE_KEY" ] || [ "$SUPABASE_SERVICE_KEY" = "your-service-role-key-here" ]; then
    echo -e "${YELLOW}⚠ SUPABASE_SERVICE_KEY not configured${NC}"
    echo -e "  Get it from: https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/api"
    echo -e "  Update .env file with SUPABASE_SERVICE_KEY\n"
fi

# Build Docker images
echo -e "${BLUE}Building Docker images...${NC}\n"

# Build API
echo -e "${BLUE}Building API...${NC}"
docker-compose build api || {
    echo -e "${RED}✗ API build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ API built successfully${NC}\n"

# Build Wallet
echo -e "${BLUE}Building Wallet...${NC}"
docker-compose build wallet || {
    echo -e "${RED}✗ Wallet build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Wallet built successfully${NC}\n"

# Build Explorer
echo -e "${BLUE}Building Explorer...${NC}"
docker-compose build explorer || {
    echo -e "${RED}✗ Explorer build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Explorer built successfully${NC}\n"

# Build Landing
echo -e "${BLUE}Building Landing...${NC}"
docker-compose build landing || {
    echo -e "${RED}✗ Landing build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Landing built successfully${NC}\n"

# Build NEX Exchange
echo -e "${BLUE}Building NEX Exchange...${NC}"
docker-compose build nex-exchange || {
    echo -e "${RED}✗ NEX Exchange build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ NEX Exchange built successfully${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ All Services Built Successfully!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Start services: ${GREEN}docker-compose up -d${NC}"
echo -e "2. Check logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "3. Verify API: ${GREEN}curl http://localhost:4000/api/v1/health${NC}"
echo -e "4. Access apps:"
echo -e "   - API: http://localhost:4000"
echo -e "   - Explorer: http://localhost:4002"
echo -e "   - Landing: http://localhost:4010"
echo -e "   - Wallet: http://localhost:4020"
echo -e "   - NEX Exchange: http://localhost:4011"
echo -e "\n${GREEN}Ready to start! 🚀${NC}"

