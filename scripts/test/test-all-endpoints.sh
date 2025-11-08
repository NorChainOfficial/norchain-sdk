#!/bin/bash

# Complete API Endpoint Test - Tests ALL endpoints
# This script tests every available endpoint from the API documentation

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
    
    ((TOTAL++))
    
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
    
    # Consider 200-299 as success, 400-499 as warnings (client errors), 500+ as failures
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  [$TOTAL] ${GREEN}✓${NC} $method $endpoint - HTTP $http_code"
        ((PASSED++))
        return 0
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "  [$TOTAL] ${YELLOW}⚠${NC} $method $endpoint - HTTP $http_code (Client Error)"
        ((WARNINGS++))
        return 1
    else
        echo -e "  [$TOTAL] ${RED}✗${NC} $method $endpoint - HTTP $http_code"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Complete API Endpoint Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get all endpoints from Swagger
echo "Fetching endpoint list from API documentation..."
ENDPOINTS=$(curl -s http://localhost:4000/api-docs-json | jq -r '.paths | to_entries[] | "\(.key)|\(.value | keys[])"' 2>/dev/null)

if [ -z "$ENDPOINTS" ]; then
    echo -e "${RED}Error: Could not fetch endpoints from API documentation${NC}"
    exit 1
fi

echo "Found endpoints. Testing..."
echo ""

# Test each endpoint
echo "$ENDPOINTS" | while IFS='|' read -r endpoint method; do
    # Convert endpoint to uppercase for method
    method_upper=$(echo "$method" | tr '[:lower:]' '[:upper:]')
    
    # Skip auth endpoints that require authentication for now
    if [[ "$endpoint" == *"/auth/"* ]] && [[ "$method" != "post" ]]; then
        continue
    fi
    
    # Prepare test data based on endpoint
    test_data="{}"
    if [[ "$endpoint" == *"/batch/"* ]]; then
        if [[ "$endpoint" == *"/balances"* ]]; then
            test_data='{"addresses":["0x0000000000000000000000000000000000000000"]}'
        elif [[ "$endpoint" == *"/transaction-counts"* ]]; then
            test_data='{"addresses":["0x0000000000000000000000000000000000000000"]}'
        elif [[ "$endpoint" == *"/blocks"* ]]; then
            test_data='{"blockNumbers":[1]}'
        elif [[ "$endpoint" == *"/token-balances"* ]]; then
            test_data='{"requests":[{"address":"0x0000000000000000000000000000000000000000","tokenAddress":"0x0000000000000000000000000000000000000000"}]}'
        fi
    elif [[ "$endpoint" == *"/swap/"* ]]; then
        test_data='{"tokenIn":"0x0000000000000000000000000000000000000000","tokenOut":"0x0000000000000000000000000000000000000001","amountIn":"1000000000000000000"}'
    elif [[ "$endpoint" == *"/orders/"* ]] && [[ "$method" == "post" ]]; then
        test_data='{"tokenIn":"0x0000000000000000000000000000000000000000","tokenOut":"0x0000000000000000000000000000000000000001","amountIn":"1000000000000000000","price":"1.0","type":"limit"}'
    elif [[ "$endpoint" == *"/contract/verifycontract"* ]]; then
        test_data='{"address":"0x0000000000000000000000000000000000000000","sourceCode":"contract Test {}"}'
    fi
    
    # Add query parameters for GET requests
    if [[ "$method" == "get" ]]; then
        if [[ "$endpoint" == *"/account/"* ]]; then
            endpoint="${endpoint}?address=0x0000000000000000000000000000000000000000&limit=1"
        elif [[ "$endpoint" == *"/block/"* ]] && [[ "$endpoint" != *"?"* ]]; then
            if [[ "$endpoint" == *"getblock"* ]]; then
                endpoint="${endpoint}?tag=latest"
            elif [[ "$endpoint" == *"getblockcountdown"* ]]; then
                endpoint="${endpoint}?blockno=1"
            fi
        elif [[ "$endpoint" == *"/transaction/"* ]] && [[ "$endpoint" != *"?"* ]]; then
            endpoint="${endpoint}?txhash=0x0000000000000000000000000000000000000000000000000000000000000000"
        elif [[ "$endpoint" == *"/token/"* ]] && [[ "$endpoint" != *"?"* ]]; then
            endpoint="${endpoint}?contractaddress=0x0000000000000000000000000000000000000000&limit=1"
        elif [[ "$endpoint" == *"/contract/"* ]] && [[ "$endpoint" != *"?"* ]]; then
            endpoint="${endpoint}?address=0x0000000000000000000000000000000000000000"
        elif [[ "$endpoint" == *"/analytics/"* ]] && [[ "$endpoint" != *"?"* ]]; then
            if [[ "$endpoint" != *"/network"* ]]; then
                endpoint="${endpoint}?address=0x0000000000000000000000000000000000000000"
            fi
        fi
    fi
    
    test_endpoint "$method_upper" "$endpoint" "$test_data" "$endpoint"
done

# Summary
echo ""
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
    echo -e "${GREEN}✅ All tests completed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests had issues. Review the output above.${NC}"
    exit 1
fi

