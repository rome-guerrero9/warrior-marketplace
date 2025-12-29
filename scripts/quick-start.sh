#!/bin/bash

# ================================================================
# Warrior AI Marketplace - Quick Start Script
# ================================================================
# One-command setup for the entire marketplace
# ================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "================================================================"
echo -e "${BLUE}⚡ Warrior AI Marketplace - Quick Start${NC}"
echo "================================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 2: Check environment variables
echo -e "${YELLOW}🔑 Checking environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.local from template...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your credentials${NC}"
    echo "After editing, run this script again"
    exit 0
else
    echo -e "${GREEN}✓${NC} .env.local exists"
fi
echo ""

# Step 3: Build test
echo -e "${YELLOW}🔨 Testing build...${NC}"
npm run build
echo -e "${GREEN}✓${NC} Build successful"
echo ""

# Step 4: Offer to set up database
echo -e "${YELLOW}🗄️  Database Setup${NC}"
echo ""
echo "Would you like to set up the database now?"
echo "This will:"
echo "  - Install Supabase CLI (if needed)"
echo "  - Link to your Supabase project"
echo "  - Run all migrations"
echo "  - Add a sample product"
echo ""
read -p "Set up database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/setup-database.sh
else
    echo "Skipping database setup"
    echo "You can run it later with: ./scripts/setup-database.sh"
fi

echo ""
echo "================================================================"
echo -e "${GREEN}✅ QUICK START COMPLETE!${NC}"
echo "================================================================"
echo ""
echo "🚀 Start the development server:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "📖 Open the marketplace:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "================================================================"
echo ""
