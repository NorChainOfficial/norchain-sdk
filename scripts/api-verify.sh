#!/bin/bash

# API Verification Script
# Verifies API Docker build, startup, health, and connectivity

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain API Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

errors=0
warnings=0

# Load .env if exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

API_PORT=${API_PORT:-4000}
API_URL="http://localhost:${API_PORT}"

# Function to check
check() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        errors=$((errors + 1))
        return 1
    fi
}

# Function to check with warning
check_warn() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ WARN${NC}"
        warnings=$((warnings + 1))
        return 1
    fi
}

# 1. Docker Build Verification
echo -e "${BLUE}=== Docker Build ===${NC}"
if [ -f "apps/api/Dockerfile" ]; then
    echo -e "${GREEN}✓ Dockerfile exists${NC}"
    
    echo -n "Testing Docker build... "
    if docker build -t norchain-api-test apps/api >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
        errors=$((errors + 1))
    fi
else
    echo -e "${RED}✗ Dockerfile not found${NC}"
    errors=$((errors + 1))
fi
echo ""

# 2. Docker Compose Verification
echo -e "${BLUE}=== Docker Compose ===${NC}"
if docker-compose config >/dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.yml has errors${NC}"
    errors=$((errors + 1))
fi
echo ""

# 3. Service Status
echo -e "${BLUE}=== Service Status ===${NC}"
if docker ps --format '{{.Names}}' | grep -q "^norchain-api$"; then
    status=$(docker inspect --format='{{.State.Status}}' norchain-api)
    health=$(docker inspect --format='{{.State.Health.Status}}' norchain-api 2>/dev/null || echo "no-healthcheck")
    
    if [ "$status" = "running" ]; then
        echo -e "${GREEN}✓ API container is running${NC}"
        if [ "$health" != "no-healthcheck" ]; then
            echo -e "  Health: $health"
        fi
    else
        echo -e "${RED}✗ API container is not running (status: $status)${NC}"
        errors=$((errors + 1))
    fi
else
    echo -e "${YELLOW}⚠ API container not found (may need to start)${NC}"
    warnings=$((warnings + 1))
fi
echo ""

# 4. Health Check
echo -e "${BLUE}=== Health Checks ===${NC}"
check "API Health Endpoint" "curl -s --max-time 5 '${API_URL}/api/v1/health' | grep -q 'status'"
check "API Stats Endpoint" "curl -s --max-time 5 '${API_URL}/api/v1/stats' | grep -q 'result\|data'"
check "Swagger Documentation" "curl -s --max-time 5 '${API_URL}/api-docs' | grep -q 'swagger'"
echo ""

# 5. Database Connectivity
echo -e "${BLUE}=== Database Connectivity ===${NC}"
if docker ps --format '{{.Names}}' | grep -q "^norchain-postgres$"; then
    check_warn "PostgreSQL Container" "docker ps --format '{{.Names}}' | grep -q '^norchain-postgres$'"
    
    # Test connection from API container
    if docker ps --format '{{.Names}}' | grep -q "^norchain-api$"; then
        check_warn "API -> PostgreSQL" "docker exec norchain-api node -e \"const {Client} = require('pg'); const client = new Client({host: 'postgres', port: 5432, user: 'postgres', password: 'postgres', database: 'norchain_explorer'}); client.connect().then(() => {client.end(); process.exit(0);}).catch(() => {process.exit(1);});\""
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL container not found${NC}"
    warnings=$((warnings + 1))
fi
echo ""

# 6. Redis Connectivity
echo -e "${BLUE}=== Redis Connectivity ===${NC}"
if docker ps --format '{{.Names}}' | grep -q "^norchain-redis$"; then
    check_warn "Redis Container" "docker ps --format '{{.Names}}' | grep -q '^norchain-redis$'"
    
    # Test connection from API container
    if docker ps --format '{{.Names}}' | grep -q "^norchain-api$"; then
        check_warn "API -> Redis" "docker exec norchain-api node -e \"const redis = require('redis'); const client = redis.createClient({host: 'redis', port: 6379}); client.connect().then(() => {client.ping().then(() => {client.quit(); process.exit(0);}).catch(() => {process.exit(1);});}).catch(() => {process.exit(1);});\""
    fi
else
    echo -e "${YELLOW}⚠ Redis container not found${NC}"
    warnings=$((warnings + 1))
fi
echo ""

# 7. Port Availability
echo -e "${BLUE}=== Port Availability ===${NC}"
if lsof -Pi :${API_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Port ${API_PORT} is in use${NC}"
else
    echo -e "${YELLOW}⚠ Port ${API_PORT} is not in use${NC}"
    warnings=$((warnings + 1))
fi
echo ""

# 8. API Response Time
echo -e "${BLUE}=== Performance ===${NC}"
if command -v curl &> /dev/null; then
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 5 "${API_URL}/api/v1/health" 2>/dev/null || echo "0")
    if [ "$(echo "$response_time > 0" | bc 2>/dev/null || echo 0)" = "1" ]; then
        echo -e "Health endpoint response time: ${response_time}s"
        if [ "$(echo "$response_time < 1" | bc 2>/dev/null || echo 0)" = "1" ]; then
            echo -e "${GREEN}✓ Response time acceptable (<1s)${NC}"
        else
            echo -e "${YELLOW}⚠ Response time slow (>1s)${NC}"
            warnings=$((warnings + 1))
        fi
    fi
fi
echo ""

# 9. Environment Variables
echo -e "${BLUE}=== Environment Configuration ===${NC}"
if docker ps --format '{{.Names}}' | grep -q "^norchain-api$"; then
    echo -e "Environment variables in container:"
    docker exec norchain-api env | grep -E "^(DB_|REDIS_|RPC_|JWT_|PORT=)" | head -10 | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠ Cannot check environment (container not running)${NC}"
    warnings=$((warnings + 1))
fi
echo ""

# Summary
echo -e "${BLUE}=== Verification Summary ===${NC}"
echo -e "Errors: ${RED}$errors${NC}"
echo -e "Warnings: ${YELLOW}$warnings${NC}"

if [ $errors -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical checks passed!${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠ Some warnings found, but API is operational${NC}"
    fi
    exit 0
else
    echo -e "\n${RED}✗ Some errors found. Please fix them before proceeding.${NC}"
    exit 1
fi

