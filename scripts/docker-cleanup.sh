#!/bin/bash

# Docker Cleanup Script for NorChain Monorepo
# Cleans up Docker resources to free up space and memory

set -e

echo "🧹 Docker Cleanup Script"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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

echo "Current Docker resource usage:"
echo "=============================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "No running containers"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# Stop all containers
print_info "Stopping all containers..."
docker-compose down 2>/dev/null || true

# Remove stopped containers
print_info "Removing stopped containers..."
docker container prune -f

# Remove unused images
print_info "Removing unused images..."
docker image prune -a -f

# Remove unused volumes (be careful!)
print_warning "Removing unused volumes..."
read -p "Remove unused volumes? This will delete data not used by any container (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume prune -f
else
    print_info "Skipping volume cleanup"
fi

# Remove unused networks
print_info "Removing unused networks..."
docker network prune -f

# Remove build cache
print_info "Removing build cache..."
docker builder prune -a -f

# Show disk usage
echo ""
echo "Docker disk usage after cleanup:"
echo "================================"
docker system df

echo ""
print_info "Cleanup complete!"
echo ""
echo "To rebuild and start services:"
echo "  docker-compose build"
echo "  docker-compose up -d"

