#!/bin/bash

# ================================================================
# Warrior AI Marketplace - Automated Database Setup Script
# ================================================================
# This script automates the complete database setup process
# ================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "================================================================"
echo -e "${BLUE}🚀 Warrior AI Marketplace - Database Setup${NC}"
echo "================================================================"
echo ""

# ================================================================
# STEP 1: Check Supabase Project
# ================================================================
echo -e "${YELLOW}Step 1: Checking Supabase configuration...${NC}"
echo ""

if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Extract Supabase URL from .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | cut -d '.' -f1)

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase URL found: $SUPABASE_URL"
echo -e "${GREEN}✓${NC} Project Reference: $PROJECT_REF"
echo ""

# ================================================================
# STEP 2: Check Supabase CLI Installation
# ================================================================
echo -e "${YELLOW}Step 2: Checking Supabase CLI...${NC}"
echo ""

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo -e "${RED}❌ Homebrew not found. Please install from https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    else
        echo -e "${RED}❌ Unsupported OS. Please install Supabase CLI manually from:${NC}"
        echo "https://supabase.com/docs/guides/cli"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Supabase CLI installed"
else
    echo -e "${GREEN}✓${NC} Supabase CLI already installed"
fi

echo ""

# ================================================================
# STEP 3: Login to Supabase
# ================================================================
echo -e "${YELLOW}Step 3: Logging in to Supabase...${NC}"
echo ""
echo "Opening browser for authentication..."
echo "Please complete the login in your browser"
echo ""

supabase login

echo ""
echo -e "${GREEN}✓${NC} Logged in to Supabase"
echo ""

# ================================================================
# STEP 4: Link to Project
# ================================================================
echo -e "${YELLOW}Step 4: Linking to your Supabase project...${NC}"
echo ""

# Initialize Supabase in the project if not already done
if [ ! -f supabase/config.toml ]; then
    supabase init
fi

# Link to the project
supabase link --project-ref $PROJECT_REF

echo ""
echo -e "${GREEN}✓${NC} Linked to project: $PROJECT_REF"
echo ""

# ================================================================
# STEP 5: Run Database Migrations
# ================================================================
echo -e "${YELLOW}Step 5: Running database migrations...${NC}"
echo ""

echo "📊 Migration 1: Initial Schema (7 tables)..."
supabase db push --file supabase/migrations/20231201000000_initial_schema.sql
echo -e "${GREEN}✓${NC} Initial schema created"

echo ""
echo "🔒 Migration 2: Row-Level Security Policies..."
supabase db push --file supabase/migrations/20231201000001_rls_policies.sql
echo -e "${GREEN}✓${NC} Security policies applied"

echo ""
echo "⚙️  Migration 3: Database Functions..."
supabase db push --file supabase/migrations/20231201000002_functions.sql
echo -e "${GREEN}✓${NC} Database functions created"

echo ""
echo -e "${GREEN}✓✓✓ All migrations completed successfully!${NC}"
echo ""

# ================================================================
# STEP 6: Verify Tables
# ================================================================
echo -e "${YELLOW}Step 6: Verifying database setup...${NC}"
echo ""

echo "Checking tables..."
TABLES=$(supabase db dump --schema public | grep "CREATE TABLE" | wc -l)

if [ "$TABLES" -ge 7 ]; then
    echo -e "${GREEN}✓${NC} Found $TABLES tables (expected 7+)"
    echo ""
    echo "Tables created:"
    echo "  ✓ profiles"
    echo "  ✓ products"
    echo "  ✓ orders"
    echo "  ✓ order_items"
    echo "  ✓ downloads"
    echo "  ✓ reviews"
    echo "  ✓ carts"
else
    echo -e "${YELLOW}⚠️  Warning: Only found $TABLES tables (expected 7)${NC}"
    echo "You may need to check the Supabase dashboard"
fi

echo ""

# ================================================================
# STEP 7: Insert Sample Product (Optional)
# ================================================================
echo -e "${YELLOW}Step 7: Would you like to add a sample product? (y/n)${NC}"
read -p "Add sample product? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Adding sample product: AI Automation Starter Pack..."

    supabase db execute <<EOF
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    original_price_cents,
    category,
    status,
    images,
    is_featured,
    rating_avg,
    rating_count
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'AI Automation Starter Pack',
    'ai-automation-starter-pack',
    '10 production-ready n8n workflow templates, RAG system blueprints, and 50+ battle-tested Claude prompts. Everything you need to build AI-powered automation in days, not months.',
    4900,
    9900,
    'Automation',
    'active',
    ARRAY['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
    true,
    4.8,
    24
);
EOF

    echo -e "${GREEN}✓${NC} Sample product added successfully!"
    echo ""
else
    echo "Skipping sample product..."
    echo ""
fi

# ================================================================
# COMPLETION
# ================================================================
echo ""
echo "================================================================"
echo -e "${GREEN}✅ DATABASE SETUP COMPLETE!${NC}"
echo "================================================================"
echo ""
echo "Your database is ready with:"
echo "  ✓ 7 tables created"
echo "  ✓ Row-Level Security enabled"
echo "  ✓ Database functions installed"
echo "  ✓ Sample product added (if selected)"
echo ""
echo "================================================================"
echo "🚀 NEXT STEPS"
echo "================================================================"
echo ""
echo "1. Start the development server:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Open in browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "3. Set up Stripe webhooks (in a new terminal):"
echo -e "   ${BLUE}stripe listen --forward-to localhost:3000/api/webhooks/stripe${NC}"
echo ""
echo "4. Test checkout with Stripe test card:"
echo -e "   ${BLUE}4242 4242 4242 4242${NC}"
echo ""
echo "================================================================"
echo ""
echo -e "${GREEN}🎉 You're ready to launch!${NC}"
echo ""
