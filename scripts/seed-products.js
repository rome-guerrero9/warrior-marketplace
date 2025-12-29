#!/usr/bin/env node
/**
 * Seed products into Supabase database
 * Uses SERVICE_ROLE_KEY to bypass RLS policies
 */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Use SERVICE ROLE KEY to bypass RLS
const supabase = createClient(supabaseUrl, serviceKey);

const VENDOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const products = [
  // MCP PRODUCTS
  {
    vendor_id: VENDOR_ID,
    name: 'MCP Starter Pack - Professional Claude Code Servers',
    slug: 'mcp-starter-pack',
    description: `Get started with professional MCP servers for Claude Code - completely free.

🎁 WHAT'S INCLUDED (3 Essential Servers):

1. Project Health Auditor (Basic) - Instant codebase health score
2. Workflow Orchestrator (Basic) - Up to 5 automated workflows
3. Domain Memory Agent - Semantic search across your docs

✅ ONE-CLICK INSTALLATION
✅ COMPLETE DOCUMENTATION
✅ NO CREDIT CARD REQUIRED`,
    price_cents: 0,
    original_price_cents: null,
    category: 'MCP Servers',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    download_url: 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-starter-pack.tar.gz',
    is_featured: true,
    rating_avg: 4.9,
    rating_count: 127
  },
  {
    vendor_id: VENDOR_ID,
    name: 'MCP Pro Pack - 10 Professional Servers',
    slug: 'mcp-pro-pack',
    description: `Level up your Claude Code workflow with 10 professional MCP servers.

💎 10 PROFESSIONAL SERVERS:
• Design to Code Converter
• Conversational API Debugger
• Project Health Auditor Pro
• Workflow Orchestrator Pro
• AI Experiment Logger
• Plus 5 more!

📈 Save 20+ hours per week
✅ Priority support included`,
    price_cents: 2700,
    original_price_cents: 4700,
    category: 'MCP Servers',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    download_url: 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-pro-pack.tar.gz',
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 89
  },
  {
    vendor_id: VENDOR_ID,
    name: 'MCP Agency Suite - Unlimited + Kali Security',
    slug: 'mcp-agency-suite',
    description: `Everything in Pro PLUS exclusive Kali Security Suite.

🔥 AGENCY EXCLUSIVE:
⚡ Kali Security Suite - 10 pentesting tools
✅ Unlimited server access
✅ Team collaboration (5 users)
✅ White-label options
✅ Private Slack channel

💰 224x ROI`,
    price_cents: 9700,
    original_price_cents: 19700,
    category: 'MCP Servers',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    download_url: 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-agency-suite.tar.gz',
    is_featured: true,
    rating_avg: 5.0,
    rating_count: 43
  },

  // AGENTFLOW PRO PRODUCTS
  {
    vendor_id: VENDOR_ID,
    name: 'AgentFlow Pro - Starter',
    slug: 'agentflow-starter',
    description: `Perfect for solo operators getting started with AI-powered workflow automation.

📦 STARTER FEATURES:
• 5 Active Clients
• 10 Projects
• White-label Portal
• Basic Automation
• Email Support

💡 Great for freelancers and solo consultants`,
    price_cents: 2900,
    original_price_cents: null,
    category: 'SaaS',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'],
    download_url: null,
    is_featured: false,
    rating_avg: 4.7,
    rating_count: 56
  },
  {
    vendor_id: VENDOR_ID,
    name: 'AgentFlow Pro - Professional',
    slug: 'agentflow-professional',
    description: `For growing teams that need advanced automation and collaboration.

🚀 PROFESSIONAL FEATURES:
• 25 Active Clients
• Unlimited Projects
• Advanced Automation
• API Access
• Team Collaboration (3 users)

⚡ Most popular tier for agencies`,
    price_cents: 7900,
    original_price_cents: null,
    category: 'SaaS',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'],
    download_url: null,
    is_featured: true,
    rating_avg: 4.9,
    rating_count: 34
  },
  {
    vendor_id: VENDOR_ID,
    name: 'AgentFlow Pro - Agency',
    slug: 'agentflow-agency',
    description: `Enterprise-grade automation for serious agencies and large teams.

💎 AGENCY FEATURES:
• Unlimited Clients
• Dedicated Success Manager
• Custom AI Integrations
• 99.9% Uptime SLA
• 24/7 Priority Support

🏆 Built for scale`,
    price_cents: 19900,
    original_price_cents: null,
    category: 'SaaS',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'],
    download_url: null,
    is_featured: false,
    rating_avg: 5.0,
    rating_count: 12
  }
];

async function seedProducts() {
  console.log('🌱 Seeding products to Supabase...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using SERVICE_ROLE_KEY (bypasses RLS)\n');

  for (const product of products) {
    console.log(`📦 Inserting: ${product.name}`);

    const { data, error } = await supabase
      .from('products')
      .upsert(product, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`   ✅ Success! Price: $${(product.price_cents / 100).toFixed(2)}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ SEEDING COMPLETE!\n');

  // Verify
  const { data: allProducts, error: verifyError } = await supabase
    .from('products')
    .select('name, category, price_cents, status');

  if (verifyError) {
    console.error('❌ Verification error:', verifyError.message);
  } else {
    console.log(`Total products in database: ${allProducts.length}\n`);
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} ($${(p.price_cents / 100).toFixed(2)}) - ${p.status}`);
    });
  }
}

seedProducts().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
