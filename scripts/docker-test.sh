#!/bin/bash

# Comprehensive Docker Environment Test Script
# Tests all services, connectivity, and functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load .env if exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
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

failed=0
total=0
passed=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Docker Environment Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local timeout=${4:-10}
    
    total=$((total + 1))
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        passed=$((passed + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
        failed=$((failed + 1))
        return 1
    fi
}

# Function to test JSON endpoint
test_json_endpoint() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    total=$((total + 1))
    echo -n "Testing $name (JSON)... "
    
    response=$(curl -s --max-time $timeout "$url" 2>/dev/null || echo "")
    
    if [ -n "$response" ] && echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC} (Valid JSON)"
        passed=$((passed + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Invalid or empty JSON)"
        failed=$((failed + 1))
        return 1
    fi
}

# Function to test service health
test_health() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    total=$((total + 1))
    echo -n "Testing $name health... "
    
    response=$(curl -s --max-time $timeout "$url" 2>/dev/null || echo "")
    
    if [ -n "$response" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        passed=$((passed + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        failed=$((failed + 1))
        return 1
    fi
}

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Test Unified API
echo -e "\n${BLUE}=== Unified API Tests ===${NC}"
test_endpoint "API Health" "http://localhost:${API_PORT}/api/v1/health" 200
test_json_endpoint "API Stats" "http://localhost:${API_PORT}/api/v1/stats"
test_endpoint "Swagger Docs" "http://localhost:${API_PORT}/api-docs" 200

# Test Explorer App
echo -e "\n${BLUE}=== Explorer App Tests ===${NC}"
test_endpoint "Explorer Homepage" "http://localhost:${EXPLORER_APP_PORT}" 200
test_endpoint "Explorer Blocks" "http://localhost:${EXPLORER_APP_PORT}/blocks" 200
test_endpoint "Explorer Transactions" "http://localhost:${EXPLORER_APP_PORT}/transactions" 200

# Test Landing Page
echo -e "\n${BLUE}=== Landing Page Tests ===${NC}"
test_endpoint "Landing Homepage" "http://localhost:${LANDING_PORT}" 200

# Test Documentation
echo -e "\n${BLUE}=== Documentation Tests ===${NC}"
test_endpoint "Documentation Homepage" "http://localhost:${DOCS_PORT}" 200

# Test NEX Exchange
echo -e "\n${BLUE}=== NEX Exchange Tests ===${NC}"
test_endpoint "NEX Exchange Homepage" "http://localhost:${NEX_EXCHANGE_PORT}" 200

# Test Wallet
echo -e "\n${BLUE}=== Wallet Web Tests ===${NC}"
test_endpoint "Wallet Homepage" "http://localhost:${WALLET_PORT}" 200

# Test Database Connectivity
echo -e "\n${BLUE}=== Database Tests ===${NC}"
if command -v psql &> /dev/null; then
    total=$((total + 1))
    echo -n "Testing PostgreSQL connection... "
    if PGPASSWORD=${DB_PASSWORD:-postgres} PGPORT=${POSTGRES_PORT} psql -h localhost -U ${DB_USER:-postgres} -d ${DB_NAME:-norchain_explorer} -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        passed=$((passed + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        failed=$((failed + 1))
    fi
    
    total=$((total + 1))
    echo -n "Testing PostgreSQL tables... "
    table_count=$(PGPASSWORD=${DB_PASSWORD:-postgres} PGPORT=${POSTGRES_PORT} psql -h localhost -U ${DB_USER:-postgres} -d ${DB_NAME:-norchain_explorer} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    if [ -n "$table_count" ] && [ "$table_count" -gt 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} ($table_count tables)"
        passed=$((passed + 1))
    else
        echo -e "${YELLOW}⚠ WARN${NC} (No tables found - may need migration)"
        failed=$((failed + 1))
    fi
else
    echo -e "${YELLOW}⚠ psql not available, skipping database tests${NC}"
fi

# Test Redis Connectivity
echo -e "\n${BLUE}=== Redis Tests ===${NC}"
if command -v redis-cli &> /dev/null; then
    total=$((total + 1))
    echo -n "Testing Redis connection... "
    if redis-cli -h localhost -p ${REDIS_PORT} ping &> /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        passed=$((passed + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        failed=$((failed + 1))
    fi
    
    total=$((total + 1))
    echo -n "Testing Redis set/get... "
    if redis-cli -h localhost -p ${REDIS_PORT} set test_key "test_value" &> /dev/null && \
       redis-cli -h localhost -p ${REDIS_PORT} get test_key | grep -q "test_value" &> /dev/null && \
       redis-cli -h localhost -p ${REDIS_PORT} del test_key &> /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        passed=$((passed + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        failed=$((failed + 1))
    fi
else
    echo -e "${YELLOW}⚠ redis-cli not available, skipping Redis tests${NC}"
fi

# Test Inter-Service Communication
echo -e "\n${BLUE}=== Inter-Service Communication Tests ===${NC}"
total=$((total + 1))
echo -n "Testing API -> PostgreSQL... "
if docker exec norchain-api node -e "const {Client} = require('pg'); const client = new Client({host: 'postgres', port: 5432, user: 'postgres', password: 'postgres', database: 'norchain_explorer'}); client.connect().then(() => {console.log('OK'); client.end(); process.exit(0);}).catch(e => {console.error('FAIL'); process.exit(1);});" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ PASS${NC}"
    passed=$((passed + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    failed=$((failed + 1))
fi

total=$((total + 1))
echo -n "Testing API -> Redis... "
if docker exec norchain-api node -e "const redis = require('redis'); const client = redis.createClient({host: 'redis', port: 6379}); client.connect().then(() => {client.ping().then(() => {console.log('OK'); client.quit(); process.exit(0);}).catch(() => {process.exit(1);});}).catch(() => {process.exit(1);});" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ PASS${NC}"
    passed=$((passed + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    failed=$((failed + 1))
fi

# Summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "Total tests: $total"
echo -e "${GREEN}Passed: $passed${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}Failed: $failed${NC}"
    echo -e "\n${RED}Some tests failed. Please check the logs:${NC}"
    echo -e "  docker-compose logs"
    exit 1
else
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
fi

