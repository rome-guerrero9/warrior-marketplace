-- ============================================
-- WARRIOR AI MARKETPLACE - PRODUCT SETUP
-- ============================================
-- This script adds both MCP Marketplace and AgentFlow Pro products
-- Run this in Supabase SQL Editor after running migrations
-- Created: 2025-12-27

-- First, create a vendor profile (you as the seller)
-- Replace 'your-auth-user-id' with your actual Supabase auth user ID
-- You can get this from: Supabase Dashboard → Authentication → Users

INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID, -- Temporary ID, replace with real auth user ID
    'rome@warrioraiautomations.com',
    'Rome Guerrero',
    'vendor',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MCP MARKETPLACE PRODUCTS (3 Tiers)
-- ============================================

-- PRODUCT 1: MCP Starter Pack (FREE)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    original_price_cents,
    category,
    status,
    download_url,
    file_size_mb,
    is_featured,
    stock_count
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'MCP Starter Pack - Professional Claude Code Servers',
    'mcp-starter-pack',
    'Get started with professional MCP servers for Claude Code - completely free.

🎁 WHAT''S INCLUDED (3 Essential Servers):

1. **Project Health Auditor** (Basic)
   - Instant codebase health score
   - Top 10 issues identified
   - Code complexity analysis
   - Perfect for: Solo developers, tech leads

2. **Workflow Orchestrator** (Basic)
   - Up to 5 automated workflows
   - Basic task dependencies
   - Manual execution
   - Perfect for: CI/CD automation, testing

3. **Domain Memory Agent**
   - Semantic search across your docs
   - Knowledge base management
   - Document summarization
   - Perfect for: Knowledge workers, researchers

✅ ONE-CLICK INSTALLATION
✅ COMPLETE DOCUMENTATION
✅ NO CREDIT CARD REQUIRED

⬆️ UPGRADE ANYTIME
Want more servers? Upgrade to Pro ($9/mo) for 10 servers including Design to Code and API Debugger.

📚 SETUP GUIDE INCLUDED
Each server comes with step-by-step installation instructions and usage examples.

**Requirements**:
- Claude Code installed
- Basic terminal knowledge
- 5 minutes setup time',
    0, -- FREE
    4900, -- Was $49, now free!
    'MCP Servers',
    'active',
    'PLACEHOLDER_DOWNLOAD_URL', -- Will be replaced with Supabase Storage URL
    0.01, -- ~6KB file
    true, -- Featured
    NULL -- Unlimited downloads
);

-- PRODUCT 2: MCP Pro Pack ($9/month)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    category,
    status,
    download_url,
    file_size_mb,
    is_featured
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'MCP Pro Pack - 10 Professional Servers for Claude Code',
    'mcp-pro-pack',
    'Level up your Claude Code workflow with 10 professional MCP servers.

💎 WHAT''S INCLUDED (10 Servers - $90 value):

**DESIGN & FRONTEND**:
1. **Design to Code Converter** ($30 value)
   - Convert Figma designs to React/Svelte/Vue
   - Screenshot to component conversion
   - Save 5-10 hours per design

**API & DEBUGGING**:
2. **Conversational API Debugger** ($20 value)
   - Debug API failures 10x faster
   - OpenAPI spec validation
   - Works with any REST API

**CODE QUALITY**:
3. **Project Health Auditor Pro** ($15 value)
   - Advanced complexity analysis
   - Test coverage recommendations
   - Historical trend tracking

**WORKFLOW AUTOMATION**:
4. **Workflow Orchestrator Pro** ($15 value)
   - Unlimited workflows
   - Parallel task execution
   - Cron-based scheduling

**AI DEVELOPMENT**:
5. **AI Experiment Logger** ($10 value)
   - Track ML experiments
   - Performance analytics dashboard

**PLUS** (from FREE tier):
6-10. All FREE tier servers + 2 bonus servers

📊 REAL RESULTS:
"Saved me 10 hours on one project alone." - Sarah K., Frontend Developer

✅ INCLUDED WITH PRO:
- All 10 servers updated monthly
- Priority email support
- Complete documentation
- Private Discord community access

💳 FLEXIBLE BILLING:
- Cancel anytime
- No contracts
- 30-day money-back guarantee

📈 AVERAGE TIME SAVED:
Pro users save 20+ hours per week',
    900, -- $9/month
    'MCP Servers',
    'active',
    'PLACEHOLDER_DOWNLOAD_URL',
    0.01,
    true
);

-- PRODUCT 3: MCP Agency Suite ($29/month)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    category,
    status,
    download_url,
    file_size_mb,
    is_featured
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'MCP Agency Suite - Unlimited Professional Servers + Kali Security',
    'mcp-agency-suite',
    'Everything in Pro PLUS exclusive Kali Security Suite and unlimited future servers.

🔥 AGENCY TIER EXCLUSIVE ($200+ value):

**SECURITY TESTING** (Exclusive - $99 value):
⚡ **Kali Security Suite** - NOT available in any other tier
   - 10 professional pentesting tools via Claude Code
   - Nmap, Nikto, SQLMap, Hydra, Nuclei, WPScan
   - Docker-isolated security environment
   - Natural language security testing

Perfect for:
   - Security researchers
   - Penetration testers
   - DevSecOps engineers
   - Bug bounty hunters

**ALL PRO SERVERS** (10 servers - $90 value):
✅ Design to Code Converter
✅ Conversational API Debugger
✅ Project Health Auditor Pro
✅ Workflow Orchestrator Pro
✅ AI Experiment Logger
✅ Plus 5 more professional servers

**AGENCY FEATURES**:
✅ **Unlimited Server Access** - All current + future servers
✅ **Early Access** - New servers 2 weeks before Pro tier
✅ **Priority Support** - Live chat + phone support
✅ **Team Collaboration** - Share with team (up to 5 users)
✅ **White-Label Options** - Rebrand for client projects
✅ **Advanced Analytics** - 365-day run history
✅ **Private Slack Channel** - Direct access to dev team

💰 ROI CALCULATOR:
- Security consultant: $200/hr × 10 hours = $2,000/month saved
- Design to code time: 10 hours/week × $75/hr = $3,000/month saved
- **Total monthly value**: $6,500+
- **Your cost**: $29/month
- **ROI**: 224x return on investment',
    2900, -- $29/month
    'MCP Servers',
    'active',
    'PLACEHOLDER_DOWNLOAD_URL',
    0.01,
    true
);

-- ============================================
-- AGENTFLOW PRO PRODUCTS (3 Tiers)
-- ============================================

-- PRODUCT 4: AgentFlow Pro - Starter ($29/month)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    category,
    status,
    is_featured
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'AgentFlow Pro - Starter',
    'agentflow-starter',
    'Transform your agency workflow with AI-powered automation. Perfect for solo operators and small teams getting started with intelligent client management.

✨ What''s Included:
• 5 active clients
• 10 projects maximum
• White-label client portal
• Basic automation workflows
• Email support
• Mobile app access
• Standard analytics dashboard

🎯 Perfect For:
Solo agencies and freelancers managing up to 5 clients who want to streamline operations without complexity.

💡 Key Benefits:
• Save 10+ hours per week on admin tasks
• Impress clients with professional white-label portal
• Automate repetitive workflows
• Track project progress in real-time

🔒 Cancel anytime. No hidden fees.',
    2900, -- $29/month
    'SaaS',
    'active',
    true
);

-- PRODUCT 5: AgentFlow Pro - Professional ($79/month)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    category,
    status,
    is_featured
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'AgentFlow Pro - Professional',
    'agentflow-professional',
    'Scale your agency with unlimited projects and advanced AI automation. For growing teams ready to dominate their market.

✨ What''s Included:
• 25 active clients
• Unlimited projects
• Advanced automation suite with custom workflows
• Priority email & chat support
• Advanced analytics & custom reporting
• Full white-label customization
• API access for integrations
• Team collaboration (up to 3 users)
• Client portal with custom branding

🎯 Perfect For:
Growing agencies managing 10-25 clients who need powerful automation and team collaboration features.

💡 Key Benefits:
• Save 20+ hours per week with advanced automation
• Scale without hiring additional admin staff
• Custom integrations with your existing tools
• Real-time collaboration with team members
• Impress clients with fully branded experience

🚀 Most Popular Choice - Best Value

🔒 Cancel anytime. No hidden fees.',
    7900, -- $79/month
    'SaaS',
    'active',
    true
);

-- PRODUCT 6: AgentFlow Pro - Agency ($199/month)
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    category,
    status,
    is_featured
) VALUES (
    '73ad4058-ad4b-4295-81c3-4c375b021760'::UUID,
    'AgentFlow Pro - Agency',
    'agentflow-agency',
    'Enterprise-grade AI automation for agencies managing unlimited clients at scale. White-glove service included.

✨ What''s Included:
• Unlimited clients
• Unlimited projects
• Dedicated success manager
• White-glove onboarding & training
• Custom AI integrations tailored to your workflow
• 99.9% uptime SLA guarantee
• Advanced security features & compliance
• Unlimited team members
• Custom training sessions for your team
• Priority feature requests
• API access with higher rate limits
• Custom reporting & analytics
• Premium support (24/7 response)

🎯 Perfect For:
Established agencies and enterprises managing 25+ clients who demand the highest level of service and customization.

💡 Key Benefits:
• Save 40+ hours per week with fully customized automation
• Scale to hundreds of clients effortlessly
• Dedicated support team knows your business
• Custom integrations built specifically for you
• Enterprise-grade security and compliance
• Your team gets personalized training

👑 Premium Support Included

🔒 Cancel anytime. No hidden fees.',
    19900, -- $199/month
    'SaaS',
    'active',
    true
);

-- ============================================
-- VERIFY PRODUCTS CREATED
-- ============================================
SELECT
    name,
    slug,
    CONCAT('$', price_cents::FLOAT / 100) as price,
    category,
    status,
    is_featured
FROM products
ORDER BY price_cents ASC;

-- Expected output: 6 products (3 MCP + 3 AgentFlow)
