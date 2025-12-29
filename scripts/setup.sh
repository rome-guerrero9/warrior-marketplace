#!/bin/bash

# Warrior AI Marketplace - Quick Setup Script
# This script automates the initial project setup

set -e

echo "========================================"
echo "Warrior AI Marketplace - Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) detected"

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo -e "${YELLOW}📝 Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} .env.local created from .env.example"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env.local with your credentials${NC}"
    echo "   1. Supabase URL and keys"
    echo "   2. Stripe API keys"
    echo "   3. Claude API key (optional)"
    echo "   4. OpenAI API key (optional)"
    echo "   5. Resend API key"
    echo ""
else
    echo -e "${GREEN}✓${NC} .env.local already exists"
fi

# Check if git is initialized
if [ ! -d .git ]; then
    echo ""
    echo -e "${YELLOW}🔧 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓${NC} Git repository initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo ""
    echo -e "${YELLOW}📝 Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/
.next

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
    echo -e "${GREEN}✓${NC} .gitignore created"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env.local with your credentials"
echo ""
echo "2. Set up Supabase:"
echo "   - Create project at https://supabase.com"
echo "   - Run migrations in SQL Editor"
echo "   - Copy URL and keys to .env.local"
echo ""
echo "3. Set up Stripe:"
echo "   - Create account at https://stripe.com"
echo "   - Get API keys from Dashboard"
echo "   - Copy keys to .env.local"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. For detailed setup instructions:"
echo "   Read SETUP_GUIDE.md"
echo ""
echo "========================================"
