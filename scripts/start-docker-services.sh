#!/bin/bash

# Start Docker services for Explorer and API testing

set -e

echo "🐳 Starting Docker Services for Explorer Testing"
echo "================================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📦 Starting services..."
docker-compose up -d postgres redis api explorer

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 Access points:"
echo "   API: http://localhost:4000/api/v1"
echo "   Explorer: http://localhost:4002"
echo ""
echo "🧪 Run tests:"
echo "   ./scripts/docker-test-explorer.sh"
echo ""
