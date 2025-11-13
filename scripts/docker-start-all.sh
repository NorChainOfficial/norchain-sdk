#!/bin/bash

# Start All Docker Services Script
# Ensures all services are started with proper resource limits

set -e

echo "🚀 Starting All Docker Services"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Create volume directories if they don't exist
print_info "Creating volume directories..."
mkdir -p .docker/postgres-data
mkdir -p .docker/redis-data

# Check Docker Desktop resources
echo ""
echo "Checking Docker Desktop resources..."
MEMORY_LIMIT=$(docker info 2>/dev/null | grep "Total Memory" | awk '{print $3}' || echo "unknown")
print_info "Docker Memory: $MEMORY_LIMIT"

if [[ "$MEMORY_LIMIT" == "unknown" ]] || [[ "$MEMORY_LIMIT" == *"GiB"* ]]; then
    MEMORY_GB=$(echo "$MEMORY_LIMIT" | sed 's/GiB//' | xargs)
    if (( $(echo "$MEMORY_GB < 4" | bc -l 2>/dev/null || echo 0) )); then
        print_warning "Docker Desktop memory is less than 4GB. Recommended: 4-6GB"
        print_warning "Go to Docker Desktop → Settings → Resources → Memory"
    fi
fi

echo ""
echo "Starting services..."
echo ""

# Start all services
docker-compose up -d

echo ""
print_info "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
echo "==============="
docker-compose ps

echo ""
echo "Resource Usage:"
echo "==============="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "No running containers"

echo ""
print_info "All services started!"
echo ""
echo "Access Points:"
echo "  - API: http://localhost:4000"
echo "  - Explorer: http://localhost:4002"
echo "  - Landing: http://localhost:4010"
echo "  - Docs: http://localhost:4011"
echo "  - NEX Exchange: http://localhost:4001"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6380"
echo ""
echo "To view logs: docker-compose logs -f <service-name>"
echo "To stop all: docker-compose down"

