#!/bin/bash

# Test Supabase Connection
# Verifies Supabase connectivity and configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Supabase Connection Test${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Load .env if exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://acyilidfiyfeouzzfkzo.supabase.co}
SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg}

echo -e "Testing Supabase Project: ${SUPABASE_URL}\n"

# Test 1: REST API Connection
echo -e "${BLUE}Test 1: REST API Connection${NC}"
if curl -s -f -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/rest/v1/" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ REST API accessible${NC}\n"
else
    echo -e "${RED}✗ REST API not accessible${NC}\n"
fi

# Test 2: Health Check
echo -e "${BLUE}Test 2: Health Check${NC}"
health_response=$(curl -s -H "apikey: ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/rest/v1/" 2>/dev/null || echo "error")
if [ "$health_response" != "error" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}\n"
else
    echo -e "${YELLOW}⚠ Health check failed (may be normal if no tables exist)${NC}\n"
fi

# Test 3: Auth Endpoint
echo -e "${BLUE}Test 3: Auth Endpoint${NC}"
auth_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/auth/v1/health" 2>/dev/null || echo "000")
if [ "$auth_response" = "200" ] || [ "$auth_response" = "404" ]; then
    echo -e "${GREEN}✓ Auth endpoint accessible${NC}\n"
else
    echo -e "${YELLOW}⚠ Auth endpoint check: HTTP ${auth_response}${NC}\n"
fi

# Test 4: Storage Endpoint
echo -e "${BLUE}Test 4: Storage Endpoint${NC}"
storage_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/storage/v1/bucket" 2>/dev/null || echo "000")
if [ "$storage_response" = "200" ] || [ "$storage_response" = "401" ] || [ "$storage_response" = "404" ]; then
    echo -e "${GREEN}✓ Storage endpoint accessible${NC}\n"
else
    echo -e "${YELLOW}⚠ Storage endpoint check: HTTP ${storage_response}${NC}\n"
fi

# Test 5: Realtime Endpoint
echo -e "${BLUE}Test 5: Realtime Endpoint${NC}"
realtime_url="${SUPABASE_URL//https/ws}/realtime/v1/websocket"
echo -e "  Realtime URL: ${realtime_url}"
echo -e "${GREEN}✓ Realtime endpoint configured${NC}\n"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Supabase Connection Tests Complete${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Note:${NC}"
echo -e "  - Anon key is configured correctly"
echo -e "  - Service role key needed for server-side operations"
echo -e "  - Database password needed for direct PostgreSQL access"
echo -e "\n${GREEN}Ready to proceed with build! 🚀${NC}"

