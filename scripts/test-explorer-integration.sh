#!/bin/bash

# Explorer API Integration Test Script
# Tests all Explorer endpoints via Docker

set -e

API_URL="${API_URL:-http://localhost:4000/api/v1}"
EXPLORER_URL="${EXPLORER_URL:-http://localhost:4002}"

echo "🧪 Testing Explorer API Integration"
echo "===================================="
echo ""
echo "API URL: $API_URL"
echo "Explorer URL: $EXPLORER_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "  Response: $body" | head -c 200
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test API Health
echo ""
echo "📋 Testing API Endpoints"
echo "-----------------------"
test_endpoint "API Health" "$API_URL/../health" 200 || true

# Test Stats
test_endpoint "Stats" "$API_URL/stats" 200

# Test Blocks
test_endpoint "Blocks List" "$API_URL/blocks?page=1&per_page=5" 200
test_endpoint "Latest Block" "$API_URL/blocks/latest" 200

# Test Transactions
test_endpoint "Transactions List" "$API_URL/transactions?page=1&limit=5" 200

# Test Accounts
test_endpoint "Accounts List" "$API_URL/accounts?page=1&per_page=5" 200

# Test Validators (existing endpoint)
test_endpoint "Validators" "$API_URL/../validators" 200 || true

# Test Explorer Pages
echo ""
echo "📋 Testing Explorer Pages"
echo "-------------------------"
test_endpoint "Explorer Homepage" "$EXPLORER_URL" 200
test_endpoint "Explorer Blocks Page" "$EXPLORER_URL/blocks" 200
test_endpoint "Explorer Transactions Page" "$EXPLORER_URL/transactions" 200
test_endpoint "Explorer Accounts Page" "$EXPLORER_URL/accounts" 200

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
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

