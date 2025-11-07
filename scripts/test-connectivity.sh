#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables with defaults
API_PORT=${API_PORT:-4000}
EXPLORER_APP_PORT=${EXPLORER_APP_PORT:-4002}
LANDING_PORT=${LANDING_PORT:-4010}
DOCS_PORT=${DOCS_PORT:-4011}
NEX_EXCHANGE_PORT=${NEX_EXCHANGE_PORT:-4001}
WALLET_PORT=${WALLET_PORT:-4020}
POSTGRES_PORT=${POSTGRES_PORT:-5433}
REDIS_PORT=${REDIS_PORT:-6380}

echo -e "${YELLOW}Testing NorChain Ecosystem Connectivity...${NC}\n"
echo -e "Using ports: API=${API_PORT}, Explorer=${EXPLORER_APP_PORT}, Landing=${LANDING_PORT}, Docs=${DOCS_PORT}, NEX=${NEX_EXCHANGE_PORT}, Wallet=${WALLET_PORT}\n"

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to test service health
test_health() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name health... "
    
    response=$(curl -s --max-time 5 "$url" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Track results
failed=0
total=0

# Test Unified API
echo "=== Unified API ==="
total=$((total + 1))
test_endpoint "API Health" "http://localhost:${API_PORT}/api/v1/health" || failed=$((failed + 1))

total=$((total + 1))
test_endpoint "API Stats" "http://localhost:${API_PORT}/api/v1/stats" || failed=$((failed + 1))

total=$((total + 1))
test_endpoint "Swagger Docs" "http://localhost:${API_PORT}/api-docs" || failed=$((failed + 1))

echo ""

# Test Explorer App
echo "=== Explorer App ==="
total=$((total + 1))
test_endpoint "Explorer App" "http://localhost:${EXPLORER_APP_PORT}" || failed=$((failed + 1))

echo ""

# Test Landing Page
echo "=== Landing Page ==="
total=$((total + 1))
test_endpoint "Landing Page" "http://localhost:${LANDING_PORT}" || failed=$((failed + 1))

echo ""

# Test Documentation
echo "=== Documentation ==="
total=$((total + 1))
test_endpoint "Documentation" "http://localhost:${DOCS_PORT}" || failed=$((failed + 1))

echo ""

# Test NEX Exchange
echo "=== NEX Exchange ==="
total=$((total + 1))
test_endpoint "NEX Exchange" "http://localhost:${NEX_EXCHANGE_PORT}" || failed=$((failed + 1))

echo ""

# Test Wallet
echo "=== Wallet ==="
total=$((total + 1))
test_endpoint "Wallet App" "http://localhost:${WALLET_PORT}" || failed=$((failed + 1))

total=$((total + 1))
test_endpoint "Wallet Health" "http://localhost:${WALLET_PORT}/api/health" || failed=$((failed + 1))

echo ""

# Test Database Connectivity (if psql is available)
if command -v psql &> /dev/null; then
    echo "=== Database ==="
    total=$((total + 1))
    echo -n "Testing PostgreSQL connection... "
    if PGPASSWORD=${DB_PASSWORD:-postgres} PGPORT=${POSTGRES_PORT} psql -h localhost -U ${DB_USER:-postgres} -d ${DB_NAME:-norchain_explorer} -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        failed=$((failed + 1))
    fi
    echo ""
fi

# Test Redis Connectivity (if redis-cli is available)
if command -v redis-cli &> /dev/null; then
    echo "=== Redis ==="
    total=$((total + 1))
    echo -n "Testing Redis connection... "
    if redis-cli -h localhost -p ${REDIS_PORT} ping &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        failed=$((failed + 1))
    fi
    echo ""
fi

# Summary
echo "=== Summary ==="
passed=$((total - failed))
echo -e "Total tests: $total"
echo -e "${GREEN}Passed: $passed${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}Failed: $failed${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi

