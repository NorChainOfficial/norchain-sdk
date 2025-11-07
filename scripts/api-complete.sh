#!/bin/bash

# API Completion Script
# Systematic API completion, testing, and verification workflow

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NorChain API Completion Workflow${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Review API Structure
echo -e "${BLUE}=== Step 1: Review API Structure ===${NC}"
echo -e "Checking API modules and endpoints...\n"

cd apps/api

# Count modules
MODULE_COUNT=$(find src/modules -mindepth 1 -maxdepth 1 -type d | wc -l | xargs)
CONTROLLER_COUNT=$(find src/modules -name "*.controller.ts" | wc -l | xargs)
SERVICE_COUNT=$(find src/modules -name "*.service.ts" | wc -l | xargs)

echo -e "Modules: ${GREEN}$MODULE_COUNT${NC}"
echo -e "Controllers: ${GREEN}$CONTROLLER_COUNT${NC}"
echo -e "Services: ${GREEN}$SERVICE_COUNT${NC}\n"

# List all modules
echo -e "API Modules:"
find src/modules -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | while read module; do
    echo -e "  - ${GREEN}$module${NC}"
done
echo ""

cd ../..

# Step 2: Build API
echo -e "${BLUE}=== Step 2: Build API ===${NC}"
echo -e "Building API Docker image...\n"

if docker-compose build api; then
    echo -e "${GREEN}✓ API build successful${NC}\n"
else
    echo -e "${RED}✗ API build failed${NC}\n"
    exit 1
fi

# Step 3: Start Infrastructure
echo -e "${BLUE}=== Step 3: Start Infrastructure ===${NC}"
echo -e "Starting PostgreSQL and Redis...\n"

docker-compose up -d postgres redis

echo -e "Waiting for infrastructure to be ready...\n"
sleep 10

# Step 4: Start API
echo -e "${BLUE}=== Step 4: Start API ===${NC}"
echo -e "Starting API service...\n"

docker-compose up -d api

echo -e "Waiting for API to be ready...\n"
sleep 15

# Step 5: Verify API
echo -e "${BLUE}=== Step 5: Verify API ===${NC}"
if [ -f scripts/api-verify.sh ]; then
    ./scripts/api-verify.sh
else
    echo -e "${YELLOW}⚠ Verification script not found${NC}"
fi
echo ""

# Step 6: Test API
echo -e "${BLUE}=== Step 6: Test API ===${NC}"
if [ -f scripts/api-test.sh ]; then
    ./scripts/api-test.sh || true
else
    echo -e "${YELLOW}⚠ Test script not found${NC}"
fi
echo ""

# Step 7: Run Unit Tests (if available)
echo -e "${BLUE}=== Step 7: Run Unit Tests ===${NC}"
cd apps/api
if [ -f package.json ] && grep -q '"test"' package.json; then
    echo -e "Running unit tests...\n"
    npm test || echo -e "${YELLOW}⚠ Some tests failed${NC}"
else
    echo -e "${YELLOW}⚠ No test script found${NC}"
fi
cd ../..
echo ""

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "API completion workflow finished."
echo -e "\nNext steps:"
echo -e "  1. Review test results"
echo -e "  2. Fix any failing tests"
echo -e "  3. Complete missing endpoints"
echo -e "  4. Run verification again"
echo -e "  5. Proceed to Phase 2 (Landing Page)"

echo -e "\n${GREEN}✓ API workflow complete!${NC}"

