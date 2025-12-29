-- =====================================================
-- WARRIOR MARKETPLACE - COMPLETE DATABASE SETUP
-- =====================================================
-- This script safely sets up ALL database objects
-- Run this in Supabase SQL Editor
-- Created: 2025-12-27

-- =====================================================
-- STEP 1: Create Extensions & Types (if not exist)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create types only if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- STEP 2: Create Tables (if not exist)
-- =====================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    original_price_cents INTEGER CHECK (original_price_cents >= 0),
    category TEXT NOT NULL,
    status product_status DEFAULT 'draft',
    images TEXT[] DEFAULT '{}',
    download_url TEXT,
    file_size_mb NUMERIC(10, 2),
    is_featured BOOLEAN DEFAULT FALSE,
    stock_count INTEGER,
    rating_avg NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID,
    customer_email TEXT NOT NULL,
    status order_status DEFAULT 'pending',
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    download_url TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID,
    session_id TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    abandoned_at TIMESTAMPTZ,
    recovery_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create Indexes (if not exist)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- STEP 4: Enable RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS Policies (drop and recreate)
-- =====================================================

-- Products: Allow anyone to view active products
DROP POLICY IF EXISTS "Active products are viewable by anyone" ON products;
CREATE POLICY "Active products are viewable by anyone" ON products FOR SELECT USING (status = 'active');

-- Products: Service role can do anything
DROP POLICY IF EXISTS "Service role can manage products" ON products;
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (true);

-- Orders: Service role can do anything
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (true);

-- Order Items: Service role can do anything
DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;
CREATE POLICY "Service role can manage order items" ON order_items FOR ALL USING (true);

-- Downloads: Service role can do anything
DROP POLICY IF EXISTS "Service role can manage downloads" ON downloads;
CREATE POLICY "Service role can manage downloads" ON downloads FOR ALL USING (true);

-- Reviews: Anyone can view
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

-- =====================================================
-- STEP 6: Add Products (upsert)
-- =====================================================

-- First insert a vendor profile (will be updated with real auth user later)
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'rome@warrioraiautomations.com',
    'Rome Guerrero',
    'vendor',
    NOW()
) ON CONFLICT (id) DO UPDATE SET role = 'vendor';

-- MCP Starter Pack (FREE)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, download_url, is_featured, rating_avg, rating_count)
VALUES (
    'b0000001-0000-0000-0000-000000000001'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'MCP Starter Pack - Professional Claude Code Servers',
    'mcp-starter-pack',
    'Get started with professional MCP servers for Claude Code - completely free. Includes 3 essential servers: Project Health Auditor, Workflow Orchestrator, and Domain Memory Agent.',
    0,
    4900,
    'MCP Servers',
    'active',
    ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    '/downloads/mcp-starter-pack.tar.gz',
    true,
    4.9,
    127
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 0;

-- MCP Pro Pack ($9/month)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, download_url, is_featured, rating_avg, rating_count)
VALUES (
    'b0000002-0000-0000-0000-000000000002'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'MCP Pro Pack - 10 Professional Servers for Claude Code',
    'mcp-pro-pack',
    'Level up your Claude Code workflow with 10 professional MCP servers including Design to Code Converter, API Debugger, and more. Save 20+ hours per week.',
    900,
    1900,
    'MCP Servers',
    'active',
    ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    '/downloads/mcp-pro-pack.tar.gz',
    true,
    4.8,
    89
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 900;

-- MCP Agency Suite ($29/month)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, download_url, is_featured, rating_avg, rating_count)
VALUES (
    'b0000003-0000-0000-0000-000000000003'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'MCP Agency Suite - Unlimited Professional Servers + Kali Security',
    'mcp-agency-suite',
    'Everything in Pro PLUS exclusive Kali Security Suite and unlimited future servers. Includes team collaboration (5 users), white-label options, and priority support.',
    2900,
    9900,
    'MCP Servers',
    'active',
    ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    '/downloads/mcp-agency-suite.tar.gz',
    true,
    5.0,
    43
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 2900;

-- AgentFlow Pro - Starter ($29/month)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, is_featured, rating_avg, rating_count)
VALUES (
    'c0000001-0000-0000-0000-000000000001'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'AgentFlow Pro - Starter',
    'agentflow-starter',
    'AI-powered agency automation for solo operators. 5 active clients, 10 projects, white-label portal, basic automation, and email support.',
    2900,
    4900,
    'SaaS',
    'active',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
    true,
    4.7,
    156
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 2900;

-- AgentFlow Pro - Professional ($79/month)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, is_featured, rating_avg, rating_count)
VALUES (
    'c0000002-0000-0000-0000-000000000002'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'AgentFlow Pro - Professional',
    'agentflow-professional',
    'Scale your agency with 25 clients, unlimited projects, advanced automation, API access, and team collaboration (3 users). Most popular choice.',
    7900,
    12900,
    'SaaS',
    'active',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
    true,
    4.9,
    234
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 7900;

-- AgentFlow Pro - Agency ($199/month)
INSERT INTO products (id, vendor_id, name, slug, description, price_cents, original_price_cents, category, status, images, is_featured, rating_avg, rating_count)
VALUES (
    'c0000003-0000-0000-0000-000000000003'::UUID,
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'AgentFlow Pro - Agency',
    'agentflow-agency',
    'Enterprise-grade with unlimited clients, dedicated success manager, custom AI integrations, 99.9% SLA, and 24/7 premium support.',
    19900,
    29900,
    'SaaS',
    'active',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
    true,
    5.0,
    87
) ON CONFLICT (slug) DO UPDATE SET status = 'active', price_cents = 19900;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT name, '$' || (price_cents::float / 100) as price, category, status FROM products ORDER BY category, price_cents;
