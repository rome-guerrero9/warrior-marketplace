-- =====================================================
-- AUTOMATED VENDOR & PRODUCT SETUP
-- =====================================================
-- This script creates a vendor profile and adds all 6 products
-- Run this in Supabase SQL Editor AFTER running migrations 1-3

-- =====================================================
-- STEP 1: Create a test vendor profile
-- =====================================================
-- NOTE: In production, this should be a real auth.users entry
-- For testing, we'll create a profile directly

DO $$
DECLARE
    test_vendor_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
BEGIN
    -- Insert vendor profile
    INSERT INTO profiles (id, email, full_name, role, avatar_url)
    VALUES (
        test_vendor_id,
        'rome@warrioraiautomations.com',
        'Rome Guerrero - Warrior AI Automations',
        'vendor',
        'https://avatars.githubusercontent.com/u/your-avatar'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        avatar_url = EXCLUDED.avatar_url;

    RAISE NOTICE 'Vendor profile created: %', test_vendor_id;
END $$;

-- =====================================================
-- STEP 2: Add all 6 products
-- =====================================================

DO $$
DECLARE
    vendor_uuid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
BEGIN

    -- =====================================================
    -- MCP SERVER PACKAGES
    -- =====================================================

    -- 1. MCP Starter Pack (FREE)
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'MCP Starter Pack - Professional Claude Code Servers',
        'mcp-starter-pack',
        E'Get started with professional MCP servers for Claude Code - completely free.\n\n🎁 WHAT''S INCLUDED (3 Essential Servers):\n\n1. Project Health Auditor (Basic) - Instant codebase health score\n2. Workflow Orchestrator (Basic) - Up to 5 automated workflows\n3. Domain Memory Agent - Semantic search across your docs\n\n✅ ONE-CLICK INSTALLATION\n✅ COMPLETE DOCUMENTATION\n✅ NO CREDIT CARD REQUIRED',
        0, NULL, 'MCP Servers', 'active',
        ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
        'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-starter-pack.tar.gz',
        true, 4.9, 127
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    -- 2. MCP Pro Pack ($9/month)
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'MCP Pro Pack - 10 Professional Servers',
        'mcp-pro-pack',
        E'Level up your Claude Code workflow with 10 professional MCP servers.\n\n💎 10 PROFESSIONAL SERVERS:\n• Design to Code Converter\n• Conversational API Debugger\n• Project Health Auditor Pro\n• Workflow Orchestrator Pro\n• AI Experiment Logger\n• Plus 5 more!\n\n📈 Save 20+ hours per week\n✅ Priority support included',
        900, 1900, 'MCP Servers', 'active',
        ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
        'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-pro-pack.tar.gz',
        true, 4.8, 89
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    -- 3. MCP Agency Suite ($29/month)
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'MCP Agency Suite - Unlimited + Kali Security',
        'mcp-agency-suite',
        E'Everything in Pro PLUS exclusive Kali Security Suite.\n\n🔥 AGENCY EXCLUSIVE:\n⚡ Kali Security Suite - 10 pentesting tools\n✅ Unlimited server access\n✅ Team collaboration (5 users)\n✅ White-label options\n✅ Private Slack channel\n\n💰 224x ROI',
        2900, 9900, 'MCP Servers', 'active',
        ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
        'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-agency-suite.tar.gz',
        true, 5.0, 43
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    -- =====================================================
    -- AGENTFLOW PRO SUBSCRIPTIONS
    -- =====================================================

    -- 4. AgentFlow Pro - Starter ($29/month)
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'AgentFlow Pro - Starter',
        'agentflow-pro-starter',
        E'AI-powered agency automation for solo operators.\n\n✨ INCLUDES:\n• 5 active clients\n• 10 projects max\n• White-label portal\n• Basic automation\n• Email support\n\n💡 Save 10+ hours/week\n🔗 Stripe: https://buy.stripe.com/test_4gMbJ0fNQ5Gl3nUd1C9Zm03',
        2900, 4900, 'SaaS', 'active',
        ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
        NULL, true, 4.7, 156
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    -- 5. AgentFlow Pro - Professional ($79/month) - MOST POPULAR
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'AgentFlow Pro - Professional',
        'agentflow-pro-professional',
        E'Scale your agency with unlimited projects.\n\n✨ INCLUDES:\n• 25 active clients\n• Unlimited projects\n• Advanced automation\n• Team collaboration (3 users)\n• API access\n\n🚀 MOST POPULAR\n💡 Save 20+ hours/week\n🔗 Stripe: https://buy.stripe.com/test_eVqaEW7hk2u98Ie1iU9Zm04',
        7900, 12900, 'SaaS', 'active',
        ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
        NULL, true, 4.9, 234
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    -- 6. AgentFlow Pro - Agency ($199/month)
    INSERT INTO products (
        id, vendor_id, name, slug, description, price_cents, original_price_cents,
        category, status, images, download_url, is_featured, rating_avg, rating_count
    ) VALUES (
        gen_random_uuid(),
        vendor_uuid,
        'AgentFlow Pro - Agency',
        'agentflow-pro-agency',
        E'Enterprise-grade automation at scale.\n\n✨ INCLUDES:\n• Unlimited clients & projects\n• Dedicated success manager\n• White-glove onboarding\n• Custom AI integrations\n• 99.9% uptime SLA\n• Unlimited team members\n\n👑 Premium Support 24/7\n🔗 Stripe: https://buy.stripe.com/test_9B6eVcdFI3ydf6C6De9Zm05',
        19900, 29900, 'SaaS', 'active',
        ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
        NULL, true, 5.0, 87
    ) ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

    RAISE NOTICE 'All 6 products added successfully!';

END $$;

-- =====================================================
-- STEP 3: Verify products were created
-- =====================================================
SELECT
    ROW_NUMBER() OVER (ORDER BY category, price_cents) as "#",
    name,
    CONCAT('$', ROUND(price_cents::numeric / 100, 2)) as price,
    category,
    status,
    CASE WHEN download_url IS NOT NULL THEN '✓ Download' ELSE '✓ Subscription' END as type,
    CASE WHEN is_featured THEN '★' ELSE '' END as featured
FROM products
ORDER BY category, price_cents;

-- =====================================================
-- STEP 4: Product count summary
-- =====================================================
SELECT
    category,
    COUNT(*) as product_count,
    CONCAT('$', MIN(price_cents::numeric / 100), ' - $', MAX(price_cents::numeric / 100)) as price_range
FROM products
GROUP BY category
ORDER BY category;
