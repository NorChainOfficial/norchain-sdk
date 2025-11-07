#!/bin/bash

# Docker Environment Verification Script
# Verifies all Docker services are properly configured and running

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Docker Environment Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Load .env if exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Loaded .env file${NC}\n"
else
    echo -e "${YELLOW}⚠ No .env file found, using defaults${NC}\n"
fi

# Set defaults
API_PORT=${API_PORT:-4000}
EXPLORER_APP_PORT=${EXPLORER_APP_PORT:-4002}
LANDING_PORT=${LANDING_PORT:-4010}
DOCS_PORT=${DOCS_PORT:-4011}
NEX_EXCHANGE_PORT=${NEX_EXCHANGE_PORT:-4001}
WALLET_PORT=${WALLET_PORT:-4020}
POSTGRES_PORT=${POSTGRES_PORT:-5433}
REDIS_PORT=${REDIS_PORT:-6380}

errors=0
warnings=0

# Function to check if port is available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} Port $port ($service) is in use"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Port $port ($service) is not in use"
        warnings=$((warnings + 1))
        return 1
    fi
}

# Function to check Docker service
check_service() {
    local service=$1
    local container_name=$2
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Status}}' $container_name)
        local health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "no-healthcheck")
        
        if [ "$status" = "running" ]; then
            if [ "$health" = "healthy" ] || [ "$health" = "no-healthcheck" ]; then
                echo -e "${GREEN}✓${NC} $service ($container_name) is running"
                if [ "$health" != "no-healthcheck" ]; then
                    echo -e "    Health: $health"
                fi
                return 0
            else
                echo -e "${YELLOW}⚠${NC} $service ($container_name) is running but unhealthy (health: $health)"
                warnings=$((warnings + 1))
                return 1
            fi
        else
            echo -e "${RED}✗${NC} $service ($container_name) is not running (status: $status)"
            errors=$((errors + 1))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $service ($container_name) container not found"
        errors=$((errors + 1))
        return 1
    fi
}

# Function to check Docker network
check_network() {
    local network=$1
    
    if docker network ls --format '{{.Name}}' | grep -q "^${network}$"; then
        echo -e "${GREEN}✓${NC} Network '$network' exists"
        return 0
    else
        echo -e "${RED}✗${NC} Network '$network' not found"
        errors=$((errors + 1))
        return 1
    fi
}

# Function to check Docker volume
check_volume() {
    local volume=$1
    
    if docker volume ls --format '{{.Name}}' | grep -q "^${volume}$"; then
        echo -e "${GREEN}✓${NC} Volume '$volume' exists"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Volume '$volume' not found (will be created on start)"
        warnings=$((warnings + 1))
        return 1
    fi
}

echo -e "${BLUE}=== Docker Prerequisites ===${NC}"
if command -v docker &> /dev/null; then
    docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Docker installed: $docker_version"
else
    echo -e "${RED}✗${NC} Docker not installed"
    errors=$((errors + 1))
fi

if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Docker Compose installed: $compose_version"
elif docker compose version &> /dev/null; then
    compose_version=$(docker compose version | awk '{print $4}')
    echo -e "${GREEN}✓${NC} Docker Compose (plugin) installed: $compose_version"
else
    echo -e "${RED}✗${NC} Docker Compose not installed"
    errors=$((errors + 1))
fi
echo ""

# Check if services are running
echo -e "${BLUE}=== Running Services ===${NC}"
check_service "PostgreSQL" "norchain-postgres"
check_service "Redis" "norchain-redis"
check_service "Unified API" "norchain-api"
check_service "Explorer App" "norchain-explorer"
check_service "Landing Page" "norchain-landing"
check_service "Documentation" "norchain-docs"
check_service "NEX Exchange" "norchain-nex-exchange"
check_service "Wallet Web" "norchain-wallet"
echo ""

# Check ports
echo -e "${BLUE}=== Port Usage ===${NC}"
check_port $API_PORT "API"
check_port $EXPLORER_APP_PORT "Explorer"
check_port $LANDING_PORT "Landing"
check_port $DOCS_PORT "Docs"
check_port $NEX_EXCHANGE_PORT "NEX Exchange"
check_port $WALLET_PORT "Wallet"
check_port $POSTGRES_PORT "PostgreSQL"
check_port $REDIS_PORT "Redis"
echo ""

# Check networks
echo -e "${BLUE}=== Docker Networks ===${NC}"
check_network "norchain-network"
check_network "norchain-network-dev" || true
echo ""

# Check volumes
echo -e "${BLUE}=== Docker Volumes ===${NC}"
check_volume "norchain-monorepo_postgres-data"
check_volume "norchain-monorepo_redis-data"
check_volume "norchain-monorepo_postgres-data-dev" || true
check_volume "norchain-monorepo_redis-data-dev" || true
echo ""

# Check Dockerfiles
echo -e "${BLUE}=== Dockerfiles ===${NC}"
for app in api explorer landing docs nex-exchange wallet; do
    if [ -f "apps/$app/Dockerfile" ]; then
        echo -e "${GREEN}✓${NC} apps/$app/Dockerfile exists"
    else
        echo -e "${RED}✗${NC} apps/$app/Dockerfile not found"
        errors=$((errors + 1))
    fi
done
echo ""

# Check docker-compose files
echo -e "${BLUE}=== Docker Compose Files ===${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
else
    echo -e "${RED}✗${NC} docker-compose.yml not found"
    errors=$((errors + 1))
fi

if [ -f "docker-compose.dev.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.dev.yml exists"
else
    echo -e "${YELLOW}⚠${NC} docker-compose.dev.yml not found"
    warnings=$((warnings + 1))
fi
echo ""

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Errors: ${RED}$errors${NC}"
echo -e "Warnings: ${YELLOW}$warnings${NC}"

if [ $errors -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical checks passed!${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠ Some warnings found, but system is operational${NC}"
    fi
    exit 0
else
    echo -e "\n${RED}✗ Some errors found. Please fix them before proceeding.${NC}"
    exit 1
fi

