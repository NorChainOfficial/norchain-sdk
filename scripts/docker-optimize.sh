#!/bin/bash

# Docker Optimization Script for NorChain Monorepo
# Optimizes Docker resource usage

set -e

echo "⚡ Docker Optimization Script"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Docker settings
echo "Checking Docker Desktop settings..."
echo ""

# Check memory limit
MEMORY_LIMIT=$(docker info 2>/dev/null | grep "Total Memory" | awk '{print $3}' || echo "unknown")
print_info "Docker Memory Limit: $MEMORY_LIMIT"

# Check disk space
DISK_USAGE=$(docker system df 2>/dev/null | grep "Local Volumes" | awk '{print $3}' || echo "unknown")
print_info "Docker Disk Usage: $DISK_USAGE"

echo ""
echo "Optimization Recommendations:"
echo "=============================="
echo ""
echo "1. Docker Desktop Settings:"
echo "   - Memory: Set to 4-6GB (recommended: 4GB)"
echo "   - CPUs: Set to 2-4 cores"
echo "   - Disk Image Size: Set to 60-80GB"
echo ""
echo "2. Container Resource Limits (already set in docker-compose.yml):"
echo "   - PostgreSQL: 512MB memory, 0.5 CPU"
echo "   - Redis: 256MB memory, 0.25 CPU"
echo "   - API: 512MB memory, 1.0 CPU"
echo "   - Explorer: 1GB memory, 1.0 CPU"
echo "   - Landing: 512MB memory"
echo "   - Docs: 512MB memory"
echo "   - NEX Exchange: 1GB memory"
echo ""
echo "3. Volume Optimization:"
echo "   - PostgreSQL data: Limited to .docker/postgres-data"
echo "   - Redis data: Limited to .docker/redis-data"
echo ""
echo "4. To reduce memory usage:"
echo "   - Stop unused containers: docker-compose stop <service>"
echo "   - Remove unused images: docker image prune -a"
echo "   - Clean build cache: docker builder prune -a"
echo ""
echo "5. To check resource usage:"
echo "   - docker stats"
echo "   - docker system df"
echo ""

print_info "Optimization complete! Check Docker Desktop settings to adjust memory/CPU limits."

