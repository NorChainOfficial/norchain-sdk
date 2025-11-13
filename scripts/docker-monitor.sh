#!/bin/bash

# Docker Resource Monitor Script
# Monitors Docker resource usage and alerts on high consumption

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "📊 Docker Resource Monitor"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running."
    exit 1
fi

# Get Docker Desktop memory limit
MEMORY_LIMIT=$(docker info 2>/dev/null | grep "Total Memory" | awk '{print $3}' || echo "unknown")
print_info "Docker Memory Limit: $MEMORY_LIMIT"

echo ""
echo "Container Resource Usage:"
echo "========================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "No containers running"

echo ""
echo "Memory Usage by Container:"
echo "=========================="
TOTAL_MEM=0
while IFS= read -r line; do
    if [[ $line =~ MemUsage.* ]]; then
        MEM=$(echo "$line" | awk '{print $2}')
        CONTAINER=$(echo "$line" | awk '{print $1}')
        MEM_NUM=$(echo "$MEM" | sed 's/MiB//' | sed 's/GiB/*1024/' | bc 2>/dev/null || echo "0")
        TOTAL_MEM=$(echo "$TOTAL_MEM + $MEM_NUM" | bc 2>/dev/null || echo "0")
        echo "  $CONTAINER: $MEM"
    fi
done < <(docker stats --no-stream --format "{{.Container}} {{.MemUsage}}" 2>/dev/null)

echo ""
echo "CPU Usage by Container:"
echo "======================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" 2>/dev/null || echo "No containers running"

echo ""
echo "Disk Usage:"
echo "==========="
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"

echo ""
echo "Recommendations:"
echo "================"

# Check memory usage
MEM_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" 2>/dev/null | head -1 | sed 's/%//' || echo "0")
if (( $(echo "$MEM_USAGE > 80" | bc -l 2>/dev/null || echo 0) )); then
    print_warning "Memory usage is above 80%. Consider:"
    echo "  - Stopping unused services"
    echo "  - Running: ./scripts/docker-cleanup.sh"
    echo "  - Increasing Docker Desktop memory limit"
fi

# Check CPU usage
CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" 2>/dev/null | head -1 | sed 's/%//' || echo "0")
if (( $(echo "$CPU_USAGE > 100" | bc -l 2>/dev/null || echo 0) )); then
    print_warning "High CPU usage detected. Consider:"
    echo "  - Checking for runaway processes"
    echo "  - Stopping services not in use"
    echo "  - Reviewing scheduled tasks/polling"
fi

echo ""
print_info "Monitor complete!"

