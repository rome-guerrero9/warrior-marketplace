# Warrior AI Marketplace - Complete Setup Guide

**Step-by-step guide to deploy your freemium AI marketplace in under 2 hours.**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Stripe Setup](#stripe-setup)
4. [Environment Configuration](#environment-configuration)
5. [Local Development](#local-development)
6. [n8n Automation Setup](#n8n-automation-setup)
7. [Vercel Deployment](#vercel-deployment)
8. [Domain Configuration](#domain-configuration)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 20+ installed ([nodejs.org](https://nodejs.org))
- ✅ Git installed
- ✅ GitHub account
- ✅ Email account for Supabase, Stripe, Vercel signups

**Create accounts** (all free tier):
1. [Supabase](https://supabase.com) - Database & auth
2. [Stripe](https://stripe.com) - Payments
3. [Vercel](https://vercel.com) - Hosting
4. [Resend](https://resend.com) - Email delivery
5. [Cloudflare](https://cloudflare.com) - DNS & CDN

**Optional** (for AI features):
- [Anthropic](https://console.anthropic.com) - Claude API (sales agent)
- [OpenAI](https://platform.openai.com) - Embeddings (RAG system)

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in details:
   - **Name**: `warrior-marketplace`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free (500MB database, 2GB bandwidth)
4. Click **Create Project** (takes ~2 minutes)

### 2. Run Database Migrations

**Option A: Using Supabase SQL Editor** (Recommended for beginners)

1. In Supabase Dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/migrations/20231201000000_initial_schema.sql`
4. Paste and click **Run**
5. Repeat for:
   - `20231201000001_rls_policies.sql`
   - `20231201000002_functions.sql`

**Option B: Using Supabase CLI** (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (public key)
   - **service_role**: `eyJhbGc...` (secret key - keep secure!)

---

## Stripe Setup

### 1. Create Stripe Account

1. Go to [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for free account
3. Activate your account (provide business details)

### 2. Get API Keys

1. Go to **Developers** → **API keys**
2. Toggle **Test mode** ON (for development)
3. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click Reveal)

### 3. Set Up Webhook

**For Local Development**:

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
```

2. Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy webhook signing secret:
```
Ready! Your webhook signing secret is whsec_... (^C to quit)
```

**For Production**:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://warrioraiautomations.com/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy **Signing secret**: `whsec_...`

---

## Environment Configuration

### 1. Create Environment File

```bash
cd warrior-marketplace
cp .env.example .env.local
```

### 2. Fill in Credentials

Edit `.env.local`:

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ============================================
# STRIPE CONFIGURATION
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# AI CONFIGURATION (Optional but recommended)
# ============================================
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# ============================================
# EMAIL CONFIGURATION
# ============================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@warrioraiautomations.com

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================
# AUTOMATION (Optional - for n8n workflows)
# ============================================
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

---

## Local Development

### 1. Install Dependencies

```bash
cd warrior-marketplace
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Test Stripe Checkout

1. Start Stripe webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0027 6000 3184`
   - Use any future expiry date, any CVC

---

## n8n Automation Setup

### Option A: n8n Cloud (Easiest)

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create new workflow
3. Import workflow JSON files from `n8n-workflows/` directory
4. Configure credentials for each workflow:
   - Supabase credentials
   - Resend API key
   - Claude API key (for personalization)
5. Activate workflows
6. Copy webhook URLs to `.env.local`

### Option B: Self-Hosted n8n (Free)

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at http://localhost:5678
```

1. Import workflows from `n8n-workflows/` directory
2. Configure credentials
3. Activate workflows
4. Use ngrok for webhook URLs:
```bash
ngrok http 5678
```

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Warrior AI Marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warrior-marketplace.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `./` (default)
5. Click **Environment Variables**:
   - Add all variables from `.env.local` (except `NODE_ENV` and `NEXT_PUBLIC_APP_URL`)
6. Click **Deploy**

### 3. Update Environment Variables

1. After deployment, go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL:
   ```
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```
3. Redeploy to apply changes

---

## Domain Configuration

### 1. Add Domain to Vercel

1. In Vercel project, go to **Settings** → **Domains**
2. Add custom domain: `warrioraiautomations.com`
3. Vercel will provide DNS records

### 2. Configure Cloudflare DNS

1. Log in to [Cloudflare](https://dash.cloudflare.com)
2. Add site: `warrioraiautomations.com`
3. Update nameservers at your domain registrar
4. In Cloudflare DNS:
   - Add **A Record**: `@` → Vercel IP (from Vercel)
   - Add **CNAME**: `www` → `cname.vercel-dns.com`
   - Add **CNAME**: `shop` → `cname.vercel-dns.com` (if using subdomain)

### 3. Configure SSL/TLS

1. In Cloudflare, go to **SSL/TLS**
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### 4. Set Up Redirects

**Redirect warriorautomations.com to warrioraiautomations.com**:

1. Add `warriorautomations.com` to Cloudflare
2. Create **Page Rule**:
   - URL: `warriorautomations.com/*`
   - Setting: **Forwarding URL** → `301 Permanent Redirect`
   - Destination: `https://warrioraiautomations.com/$1`

---

## Post-Deployment Checklist

### Security

- [ ] Enable Supabase Row-Level Security (RLS) - ✅ Already configured in migrations
- [ ] Rotate Stripe webhook secret for production
- [ ] Add Vercel IP to Supabase allowed list (optional)
- [ ] Enable 2FA on all accounts (Supabase, Stripe, Vercel, Cloudflare)

### Stripe

- [ ] Update Stripe webhook URL to production domain
- [ ] Test checkout flow with test cards
- [ ] Switch to live mode when ready:
  1. Get live API keys from Stripe
  2. Update environment variables in Vercel
  3. Verify webhook is receiving events

### Email

- [ ] Verify domain in Resend
- [ ] Set up SPF, DKIM, DMARC records for email deliverability
- [ ] Test order confirmation emails
- [ ] Test abandoned cart recovery emails

### Analytics

- [ ] Enable Vercel Analytics
- [ ] Set up Google Analytics 4 (optional)
- [ ] Set up Plausible Analytics (privacy-friendly alternative)

### SEO

- [ ] Submit sitemap to Google Search Console
- [ ] Verify meta tags and Open Graph images
- [ ] Set up Google Analytics and Search Console
- [ ] Create `robots.txt` and `sitemap.xml`

### Monitoring

- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Configure Sentry for error tracking
- [ ] Set up Stripe email alerts for failed payments
- [ ] Create Slack webhook for critical alerts

---

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to Supabase

**Solutions**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check if Supabase project is paused (free tier pauses after 1 week of inactivity)
3. Verify API keys are not expired
4. Check Supabase dashboard for any service outages

### Stripe Webhook Not Working

**Problem**: Webhook events not received

**Solutions**:
1. Verify webhook URL is correct
2. Check webhook signing secret matches `.env.local`
3. For local dev, ensure `stripe listen` is running
4. Check Stripe Dashboard → Developers → Webhooks for failed events
5. Verify endpoint is selecting correct events

### Build Failures

**Problem**: Vercel deployment fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `npm run build` locally to reproduce issue
4. Check for TypeScript errors: `npm run type-check`
5. Clear Vercel cache and redeploy

### Missing Migrations

**Problem**: Tables don't exist in Supabase

**Solutions**:
1. Run migrations in order (000, 001, 002)
2. Check SQL Editor for error messages
3. Verify UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
4. Check that Postgres version is 14+ (Supabase default)

### Rate Limiting

**Problem**: Too many requests to API

**Solutions**:
1. Implement caching for product listings
2. Use Vercel Edge Caching
3. Add rate limiting to API routes
4. Upgrade to Supabase Pro if hitting database limits

---

## Next Steps

After successful deployment:

1. **Add Products**: Create your first products in Supabase
2. **Test Checkout**: Complete a full purchase flow
3. **Set Up Workflows**: Import and configure n8n automation
4. **Content Marketing**: Write 10 SEO-optimized blog posts
5. **Launch**: Announce on Product Hunt, Twitter, LinkedIn

---

## Support

- **Email**: support@warrioraiautomations.com
- **Documentation**: [docs.warrioraiautomations.com](https://docs.warrioraiautomations.com)
- **GitHub Issues**: [Report a bug](https://github.com/romeguerrero/warrior-marketplace/issues)

---

**Built with AI. Powered by Innovation. Driven by Results.**

© 2025 Warrior AI Automations | Rome Guerrero
