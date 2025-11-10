#!/bin/bash

# Supabase Integration Test Runner
# This script sets up the environment and runs integration tests against Supabase

set -e

echo "🚀 Starting Supabase Integration Tests"
echo "========================================"

# Check if Supabase environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "⚠️  Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set"
  echo "   Tests will run but may skip Supabase-specific tests"
fi

# Load environment variables from .env.test if it exists
if [ -f .env.test ]; then
  echo "📝 Loading environment from .env.test"
  export $(cat .env.test | grep -v '^#' | xargs)
fi

# Start Docker services for integration testing
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.integration.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if API is healthy
echo "🏥 Checking API health..."
for i in {1..30}; do
  if curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ API failed to become healthy"
    docker-compose -f docker-compose.integration.yml logs api-integration
    exit 1
  fi
  sleep 2
done

# Run integration tests
echo "🧪 Running Supabase integration tests..."
npm run test:integration -- --testPathPattern="supabase"

# Capture exit code
TEST_EXIT_CODE=$?

# Cleanup
echo "🧹 Cleaning up..."
docker-compose -f docker-compose.integration.yml down -v

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All integration tests passed!"
else
  echo "❌ Some integration tests failed"
  exit $TEST_EXIT_CODE
fi

