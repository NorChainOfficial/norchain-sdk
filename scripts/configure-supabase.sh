#!/bin/bash

# Configure Supabase for NorChain Monorepo
# This script updates all environment files with Supabase credentials

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Supabase Configuration Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Supabase credentials
SUPABASE_URL="https://acyilidfiyfeouzzfkzo.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"

echo -e "${GREEN}✓ Using Supabase Project:${NC}"
echo -e "  URL: ${SUPABASE_URL}"
echo -e "  Anon Key: ${SUPABASE_ANON_KEY:0:50}...\n"

# Create root .env file
echo -e "${BLUE}Creating root .env file...${NC}"
cat > .env << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
USE_SUPABASE=true

# API Configuration
API_PORT=4000
PORT=4000

# Database (using Supabase)
SUPABASE_DB_URL=postgresql://postgres:password@db.acyilidfiyfeouzzfkzo.supabase.co:5432/postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6380

# RPC
RPC_URL=https://rpc.norchain.org
RPC_CHAIN_ID=65001

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:4000,http://localhost:4010,http://localhost:4020

# Application Ports
EXPLORER_APP_PORT=3000
LANDING_PORT=3001
DOCS_PORT=4010
NEX_EXCHANGE_PORT=4011
WALLET_PORT=4020
EOF
echo -e "${GREEN}✓ Root .env created${NC}\n"

# Update wallet app .env.local
echo -e "${BLUE}Updating wallet app configuration...${NC}"
mkdir -p apps/wallet
cat > apps/wallet/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RPC_URL=https://rpc.norchain.org
NEXT_PUBLIC_CHAIN_ID=65001
EOF
echo -e "${GREEN}✓ Wallet app .env.local created${NC}\n"

# Update API .env
echo -e "${BLUE}Updating API configuration...${NC}"
mkdir -p apps/api
cat > apps/api/.env << EOF
# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
USE_SUPABASE=true

# Database (Supabase PostgreSQL)
SUPABASE_DB_URL=postgresql://postgres:password@db.acyilidfiyfeouzzfkzo.supabase.co:5432/postgres

# API Configuration
PORT=4000
NODE_ENV=development

# Redis
REDIS_HOST=redis
REDIS_PORT=6380

# RPC
RPC_URL=https://rpc.norchain.org

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:4000,http://localhost:4010,http://localhost:4020

# JWT
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
EOF
echo -e "${GREEN}✓ API .env created${NC}\n"

# Update docker-compose.yml with Supabase env vars
echo -e "${BLUE}Updating docker-compose.yml...${NC}"
if [ -f docker-compose.yml ]; then
    # Check if SUPABASE_URL is already in docker-compose.yml
    if ! grep -q "SUPABASE_URL" docker-compose.yml; then
        echo -e "${YELLOW}⚠ docker-compose.yml needs manual update for Supabase${NC}"
        echo -e "  Add these environment variables to your services:"
        echo -e "  - SUPABASE_URL=${SUPABASE_URL}"
        echo -e "  - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
    else
        echo -e "${GREEN}✓ docker-compose.yml already has Supabase config${NC}"
    fi
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Supabase Configuration Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}⚠ Important Next Steps:${NC}"
echo -e "1. Get your Supabase Service Role Key from:"
echo -e "   https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/api"
echo -e "2. Update SUPABASE_SERVICE_KEY in .env files"
echo -e "3. Get your database password from Supabase Dashboard"
echo -e "4. Update SUPABASE_DB_URL with correct password"
echo -e "5. Run database migrations"
echo -e "\n${GREEN}Ready to build! 🚀${NC}"

