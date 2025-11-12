#!/bin/bash

# Start Docker services for Explorer and API testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Starting Docker Services for Explorer Testing${NC}"
echo "================================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Starting services (postgres, redis, api, explorer)...${NC}"
docker-compose up -d postgres redis api explorer

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Redis
echo -n "Waiting for Redis..."
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for API
echo -n "Waiting for API..."
for i in {1..60}; do
    if curl -s http://localhost:4000/api/v1/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Explorer
echo -n "Waiting for Explorer..."
for i in {1..60}; do
    if curl -s http://localhost:4002 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Services started!${NC}"
echo ""
echo -e "${BLUE}🌐 Access points:${NC}"
echo "   📡 API:              http://localhost:4000/api/v1"
echo "   📡 API Docs:         http://localhost:4000/api-docs"
echo "   🔍 Explorer:         http://localhost:4002"
echo "   📚 Explorer API Docs: http://localhost:4002/api"
echo "   🗄️  PostgreSQL:        localhost:5433"
echo "   💾 Redis:            localhost:6380"
echo ""
echo -e "${BLUE}🧪 Testing:${NC}"
echo "   Quick test:         curl http://localhost:4000/api/v1/stats"
echo "   Full test suite:    ./scripts/docker-test-explorer.sh"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "   View logs:          docker-compose logs -f [service]"
echo "   Stop services:      docker-compose down"
echo "   Restart service:    docker-compose restart [service]"
echo ""
