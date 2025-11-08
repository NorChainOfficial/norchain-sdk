#!/bin/bash

# Comprehensive Test Script for NorChain Services
# Tests all services and endpoints

set -e

API_URL="http://localhost:4000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "  Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} HTTP $http_code"
        ((PASSED++))
        return 0
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}⚠${NC} HTTP $http_code (Client Error - may be expected)"
        ((WARNINGS++))
        return 1
    else
        echo -e "${RED}✗${NC} HTTP $http_code"
        ((FAILED++))
        return 1
    fi
}

test_frontend() {
    local port=$1
    local name=$2
    
    echo -n "  Testing $name (port $port)... "
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>&1)
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓${NC} HTTP $status"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} HTTP $status"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain Services Comprehensive Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Infrastructure Tests
echo -e "${BLUE}1. Infrastructure Tests${NC}"
echo ""

echo -n "  Testing PostgreSQL... "
if docker-compose exec -T postgres psql -U postgres -d norchain_explorer -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Connected"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Connection failed"
    ((FAILED++))
fi

echo -n "  Testing Redis... "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Connected"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Connection failed"
    ((FAILED++))
fi

echo ""

# 2. API Tests
echo -e "${BLUE}2. API Endpoint Tests${NC}"
echo ""

test_endpoint "GET" "/health" "" "Health check"
test_endpoint "GET" "/account/balance?address=0x0000000000000000000000000000000000000000" "" "Account balance"
test_endpoint "GET" "/stats" "" "Network stats"
test_endpoint "GET" "/analytics/network" "" "Network analytics"
test_endpoint "GET" "/gas/estimate" "" "Gas estimation"

echo ""

# 3. Frontend Services Tests
echo -e "${BLUE}3. Frontend Services Tests${NC}"
echo ""

test_frontend "4002" "Explorer"
test_frontend "3001" "Landing"
test_frontend "4020" "Wallet"
test_frontend "4011" "NEX Exchange"

echo ""

# 4. Service Status
echo -e "${BLUE}4. Service Status${NC}"
echo ""

docker-compose ps --format "table {{.Name}}\t{{.Status}}" | head -8

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the output above.${NC}"
    exit 1
fi

