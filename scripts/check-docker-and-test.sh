#!/bin/bash

# Check Docker and run tests

set -e

echo "🔍 Checking Docker Status..."
echo "============================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for it to fully start"
    echo "  3. Run this script again"
    echo ""
    echo "Or test locally without Docker:"
    echo "  - Start API: cd apps/api && npm run start:dev"
    echo "  - Start Explorer: cd apps/explorer && npm run dev"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if containers are running
if ! docker ps | grep -q "norchain-api"; then
    echo "⚠️  Containers are not running"
    echo "Starting services..."
    ./scripts/start-docker-services.sh
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 20
else
    echo "✅ Containers are running"
fi

echo ""
echo "🧪 Running tests..."
echo ""

./scripts/docker-test-explorer.sh
