#!/bin/bash

# API Endpoints Test Script
# Tests all available API endpoints

set -e

API_URL="http://localhost:4000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  API Endpoints Test"
echo "=========================================="
echo ""

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} HTTP $http_code"
        return 0
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}⚠${NC} HTTP $http_code (Client Error)"
        return 1
    else
        echo -e "${RED}✗${NC} HTTP $http_code"
        return 1
    fi
}

# Health Check
echo "1. Health Check"
test_endpoint "GET" "/health" "" "Health endpoint"
echo ""

# Blocks
echo "2. Blocks Endpoints"
test_endpoint "GET" "/blocks?limit=1" "" "Get blocks"
test_endpoint "GET" "/blocks/latest" "" "Get latest block"
echo ""

# Transactions
echo "3. Transactions Endpoints"
test_endpoint "GET" "/transactions?limit=1" "" "Get transactions"
echo ""

# Tokens
echo "4. Token Endpoints"
test_endpoint "GET" "/tokens?limit=1" "" "Get tokens"
echo ""

# Stats
echo "5. Stats Endpoints"
test_endpoint "GET" "/stats" "" "Get network stats"
echo ""

# Analytics
echo "6. Analytics Endpoints"
test_endpoint "GET" "/analytics/network" "" "Get network analytics"
echo ""

echo "=========================================="
echo "  Tests Complete"
echo "=========================================="

