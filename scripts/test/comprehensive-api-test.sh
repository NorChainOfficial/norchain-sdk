#!/bin/bash

# Comprehensive API Endpoint Test Script
# Tests all available API endpoints systematically

set -e

API_URL="http://localhost:4000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0
TOTAL=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    
    ((TOTAL++))
    echo -n "  [$TOTAL] Testing $description... "
    
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
        # Client errors might be expected for some endpoints
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}✓${NC} HTTP $http_code (Expected)"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} HTTP $http_code (Client Error)"
            ((WARNINGS++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} HTTP $http_code"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Comprehensive API Endpoint Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Health Endpoints
echo -e "${BLUE}1. Health Endpoints${NC}"
test_endpoint "GET" "/health" "" "Health check"
test_endpoint "GET" "/health/live" "" "Liveness probe"
test_endpoint "GET" "/health/ready" "" "Readiness probe"
echo ""

# Account Endpoints
echo -e "${BLUE}2. Account Endpoints${NC}"
test_endpoint "GET" "/account/balance?address=0x0000000000000000000000000000000000000000" "" "Account balance"
test_endpoint "GET" "/account/txlist?address=0x0000000000000000000000000000000000000000&limit=1" "" "Transaction list"
test_endpoint "GET" "/account/tokenlist?address=0x0000000000000000000000000000000000000000" "" "Token list"
test_endpoint "GET" "/account/tokentx?address=0x0000000000000000000000000000000000000000&limit=1" "" "Token transactions"
test_endpoint "GET" "/account/summary?address=0x0000000000000000000000000000000000000000" "" "Account summary"
echo ""

# Block Endpoints
echo -e "${BLUE}3. Block Endpoints${NC}"
test_endpoint "GET" "/block/getblocknumber" "" "Get block number"
test_endpoint "GET" "/block/getblock?tag=latest" "" "Get latest block"
test_endpoint "GET" "/block/getblockcountdown?blockno=1" "" "Get block countdown"
echo ""

# Transaction Endpoints
echo -e "${BLUE}4. Transaction Endpoints${NC}"
test_endpoint "GET" "/transaction/getstatus?txhash=0x0000000000000000000000000000000000000000000000000000000000000000" "" "Transaction status" 404
test_endpoint "GET" "/transaction/gettxinfo?txhash=0x0000000000000000000000000000000000000000000000000000000000000000" "" "Transaction info" 404
echo ""

# Token Endpoints
echo -e "${BLUE}5. Token Endpoints${NC}"
test_endpoint "GET" "/token/tokeninfo?contractaddress=0x0000000000000000000000000000000000000000" "" "Token info"
test_endpoint "GET" "/token/tokensupply?contractaddress=0x0000000000000000000000000000000000000000" "" "Token supply"
test_endpoint "GET" "/token/tokentx?contractaddress=0x0000000000000000000000000000000000000000&limit=1" "" "Token transactions"
echo ""

# Contract Endpoints
echo -e "${BLUE}6. Contract Endpoints${NC}"
test_endpoint "GET" "/contract/getabi?address=0x0000000000000000000000000000000000000000" "" "Contract ABI"
test_endpoint "GET" "/contract/getsourcecode?address=0x0000000000000000000000000000000000000000" "" "Contract source code"
echo ""

# Stats Endpoints
echo -e "${BLUE}7. Stats Endpoints${NC}"
test_endpoint "GET" "/stats/ethsupply" "" "ETH supply"
test_endpoint "GET" "/stats/ethprice" "" "ETH price"
test_endpoint "GET" "/stats/chainsize" "" "Chain size"
test_endpoint "GET" "/stats/nodecount" "" "Node count"
echo ""

# Analytics Endpoints
echo -e "${BLUE}8. Analytics Endpoints${NC}"
test_endpoint "GET" "/analytics/network" "" "Network analytics"
test_endpoint "GET" "/analytics/portfolio?address=0x0000000000000000000000000000000000000000" "" "Portfolio analytics"
test_endpoint "GET" "/analytics/transactions?address=0x0000000000000000000000000000000000000000" "" "Transaction analytics"
echo ""

# Gas Endpoints
echo -e "${BLUE}9. Gas Endpoints${NC}"
test_endpoint "GET" "/gas/estimate" "" "Gas estimation"
echo ""

# Batch Endpoints
echo -e "${BLUE}10. Batch Endpoints${NC}"
test_endpoint "POST" "/batch/balances" '{"addresses":["0x0000000000000000000000000000000000000000"]}' "Batch balances"
test_endpoint "POST" "/batch/transaction-counts" '{"addresses":["0x0000000000000000000000000000000000000000"]}' "Batch transaction counts"
test_endpoint "POST" "/batch/blocks" '{"blockNumbers":[1]}' "Batch blocks"
echo ""

# Swap Endpoints
echo -e "${BLUE}11. Swap Endpoints${NC}"
test_endpoint "POST" "/swap/quote" '{"tokenIn":"0x0000000000000000000000000000000000000000","tokenOut":"0x0000000000000000000000000000000000000001","amountIn":"1000000000000000000"}' "Swap quote"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  Total Tests: $TOTAL"
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

