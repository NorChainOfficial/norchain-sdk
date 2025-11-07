#!/bin/bash

# Comprehensive API Testing Script
# Tests all API endpoints, validates responses, and checks error handling

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

API_URL=${API_URL:-http://localhost:4000}
API_BASE="${API_URL}/api/v1"

failed=0
total=0
passed=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain API Comprehensive Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "API Base URL: ${YELLOW}${API_BASE}${NC}\n"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=${3:-200}
    local data=${4:-""}
    local description=${5:-"$endpoint"}
    
    total=$((total + 1))
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${API_BASE}${endpoint}" 2>/dev/null || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" --max-time 10 \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_BASE}${endpoint}" 2>/dev/null || echo "000")
    fi
    
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
    local method=$1
    local endpoint=$2
    local data=${3:-""}
    local description=${4:-"$endpoint"}
    
    total=$((total + 1))
    echo -n "Testing $description (JSON)... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s --max-time 10 "${API_BASE}${endpoint}" 2>/dev/null || echo "")
    else
        response=$(curl -s --max-time 10 -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_BASE}${endpoint}" 2>/dev/null || echo "")
    fi
    
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

# Wait for API to be ready
echo -e "${YELLOW}Waiting for API to be ready...${NC}"
for i in {1..30}; do
    if curl -s --max-time 2 "${API_BASE}/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ API is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ API not ready after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Test Health Endpoint
echo -e "${BLUE}=== Health & Status ===${NC}"
test_endpoint "GET" "/health" 200 "" "Health Check"
test_json_endpoint "GET" "/health" "" "Health Check JSON"
test_endpoint "GET" "/stats" 200 "" "Stats Endpoint"
test_json_endpoint "GET" "/stats" "" "Stats JSON"
echo ""

# Test Account Endpoints
echo -e "${BLUE}=== Account Module ===${NC}"
# Using a test address (replace with real address)
TEST_ADDRESS="0x0000000000000000000000000000000000000000"
test_endpoint "GET" "/account/${TEST_ADDRESS}/balance" 200 "" "Account Balance"
test_endpoint "GET" "/account/${TEST_ADDRESS}/transactions?limit=10" 200 "" "Account Transactions"
test_endpoint "GET" "/account/${TEST_ADDRESS}/tokens" 200 "" "Account Tokens"
echo ""

# Test Block Endpoints
echo -e "${BLUE}=== Block Module ===${NC}"
test_endpoint "GET" "/blocks?limit=10" 200 "" "Latest Blocks"
test_endpoint "GET" "/blocks/1" 200 "" "Get Block by Height"
test_json_endpoint "GET" "/blocks/1" "" "Get Block JSON"
echo ""

# Test Transaction Endpoints
echo -e "${BLUE}=== Transaction Module ===${NC}"
test_endpoint "GET" "/transactions?limit=10" 200 "" "Latest Transactions"
# Note: Transaction hash test would need a real hash
echo ""

# Test Token Endpoints
echo -e "${BLUE}=== Token Module ===${NC}"
test_endpoint "GET" "/tokens?limit=10" 200 "" "Token List"
echo ""

# Test Contract Endpoints
echo -e "${BLUE}=== Contract Module ===${NC}"
# Note: Contract address test would need a real address
echo ""

# Test Stats Endpoints
echo -e "${BLUE}=== Stats Module ===${NC}"
test_endpoint "GET" "/stats" 200 "" "Network Stats"
test_json_endpoint "GET" "/stats" "" "Network Stats JSON"
echo ""

# Test Gas Endpoints
echo -e "${BLUE}=== Gas Module ===${NC}"
test_endpoint "GET" "/gas/oracle" 200 "" "Gas Oracle"
test_json_endpoint "GET" "/gas/oracle" "" "Gas Oracle JSON"
echo ""

# Test Proxy Endpoints (JSON-RPC)
echo -e "${BLUE}=== Proxy Module (JSON-RPC) ===${NC}"
test_endpoint "GET" "/proxy/eth_blockNumber" 200 "" "eth_blockNumber"
test_endpoint "GET" "/proxy/eth_gasPrice" 200 "" "eth_gasPrice"
echo ""

# Test Batch Endpoints
echo -e "${BLUE}=== Batch Module ===${NC}"
BATCH_DATA='{"addresses":["0x0000000000000000000000000000000000000000"]}'
test_endpoint "POST" "/batch/balances" 200 "$BATCH_DATA" "Batch Balances"
echo ""

# Test Analytics Endpoints
echo -e "${BLUE}=== Analytics Module ===${NC}"
test_endpoint "GET" "/analytics/network" 200 "" "Network Analytics"
echo ""

# Test Auth Endpoints (if not authenticated, should return 401 or allow registration)
echo -e "${BLUE}=== Auth Module ===${NC}"
test_endpoint "POST" "/auth/register" 201 '{"email":"test@example.com","password":"test123"}' "User Registration" || true
echo ""

# Test Swagger Documentation
echo -e "${BLUE}=== Documentation ===${NC}"
test_endpoint "GET" "/api-docs" 200 "" "Swagger Docs"
test_endpoint "GET" "/api-docs-json" 200 "" "Swagger JSON"
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "Total tests: $total"
echo -e "${GREEN}Passed: $passed${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}Failed: $failed${NC}"
    echo -e "\n${RED}Some tests failed. Please check the API logs:${NC}"
    echo -e "  docker-compose logs api"
    exit 1
else
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
fi

