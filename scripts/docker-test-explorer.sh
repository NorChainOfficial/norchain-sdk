#!/bin/bash

# Docker-based Explorer API Integration Test Script
# Tests Explorer endpoints via Docker containers

set -e

echo "🐳 Docker Explorer Integration Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if containers are running
if ! docker ps | grep -q "norchain-api"; then
    echo -e "${YELLOW}⚠️  API container not running. Starting services...${NC}"
    docker-compose up -d postgres redis api
    echo "⏳ Waiting for API to be ready..."
    sleep 15
fi

if ! docker ps | grep -q "norchain-explorer"; then
    echo -e "${YELLOW}⚠️  Explorer container not running. Starting Explorer...${NC}"
    docker-compose up -d explorer
    echo "⏳ Waiting for Explorer to be ready..."
    sleep 20
fi

API_URL="http://localhost:4000/api/v1"
EXPLORER_URL="http://localhost:4002"

echo -e "${BLUE}API URL: $API_URL${NC}"
echo -e "${BLUE}Explorer URL: $EXPLORER_URL${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        if [ -n "$body" ]; then
            echo "  Response preview: $(echo "$body" | head -c 100)"
        fi
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test API Health
echo "📋 Testing API Endpoints"
echo "-----------------------"
test_endpoint "API Health" "http://localhost:4000/api/v1/../health" 200 || true

# Test Explorer API Endpoints
test_endpoint "Stats" "$API_URL/stats" 200
test_endpoint "Blocks List" "$API_URL/blocks?page=1&per_page=5" 200
test_endpoint "Latest Block" "$API_URL/blocks/latest" 200
test_endpoint "Transactions List" "$API_URL/transactions?page=1&limit=5" 200
test_endpoint "Accounts List" "$API_URL/accounts?page=1&per_page=5" 200

# Test Explorer Pages
echo ""
echo "📋 Testing Explorer Pages"
echo "-------------------------"
test_endpoint "Explorer Homepage" "$EXPLORER_URL" 200
test_endpoint "Explorer Blocks Page" "$EXPLORER_URL/blocks" 200
test_endpoint "Explorer Transactions Page" "$EXPLORER_URL/transactions" 200
test_endpoint "Explorer Accounts Page" "$EXPLORER_URL/accounts" 200

# Test API from Explorer container
echo ""
echo "📋 Testing Internal API Access (from Explorer container)"
echo "------------------------------------------------------"
if docker exec norchain-explorer wget -q -O- http://api:3000/api/v1/stats > /dev/null 2>&1; then
    echo -e "Internal API access: ${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "Internal API access: ${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo -e "${GREEN}Failed: $FAILED${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🌐 Access Explorer at: $EXPLORER_URL"
    echo "🔌 API available at: $API_URL"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "💡 Check container logs:"
    echo "   docker-compose logs api"
    echo "   docker-compose logs explorer"
    exit 1
fi

