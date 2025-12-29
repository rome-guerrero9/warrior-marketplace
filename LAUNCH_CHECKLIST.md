# 🚀 Warrior AI Marketplace - Launch Checklist

**Let's get your marketplace live and accepting payments!**

---

## ✅ Phase 1: Local Setup (15 minutes)

### Step 1: Install Dependencies

```bash
cd /home/romex/projects/warrior-marketplace
npm install
```

**Verify**: Should see "added XXX packages"

---

### Step 2: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: `warrior-marketplace`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Project** (takes ~2 minutes)

**Wait for**: "Project is ready" message

---

### Step 3: Run Database Migrations

**Option A: SQL Editor (Easiest)**

1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy/paste contents of:
   ```
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000000_initial_schema.sql
   ```
4. Click **Run** (should see "Success. No rows returned")
5. Repeat for:
   - `20231201000001_rls_policies.sql`
   - `20231201000002_functions.sql`

**Verify**: Go to **Table Editor** → Should see 7 tables (profiles, products, orders, etc.)

---

### Step 4: Get Supabase Credentials

1. In Supabase Dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (Click "Copy")
   - **service_role**: `eyJhbGc...` (Click "Reveal" then "Copy")

**Save these** - you'll need them in the next step!

---

### Step 5: Set Up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up / Login
3. Toggle **Test Mode** ON (top right)
4. Go to **Developers** → **API keys**
5. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (Click "Reveal")

**Save these** too!

---

### Step 6: Configure Environment Variables

```bash
cd /home/romex/projects/warrior-marketplace
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Paste your Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Paste your Stripe values
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # We'll get this in Step 7

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### Step 7: Start Stripe Webhook Forwarding

**Terminal 1** (keep this running):
```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Linux: Download from github.com/stripe/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see:
```
Ready! Your webhook signing secret is whsec_... (^C to quit)
```

**Copy that `whsec_...`** and add it to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### Step 8: Start Development Server

**Terminal 2**:
```bash
cd /home/romex/projects/warrior-marketplace
npm run dev
```

**Open**: [http://localhost:3000](http://localhost:3000)

**Verify**: You should see the Warrior AI Marketplace homepage!

---

## ✅ Phase 2: Test Locally (15 minutes)

### Step 9: Add Your First Product

1. Open Supabase Dashboard → **Table Editor** → **products**
2. Click **Insert** → **Insert row**
3. Fill in:
   ```
   id: (auto-generated)
   vendor_id: (copy your user ID from profiles table)
   name: AI Automation Starter Pack
   slug: ai-automation-starter-pack
   description: 10 n8n workflow templates, RAG blueprints, and 50+ Claude prompts
   price_cents: 4900
   original_price_cents: 9900
   category: Automation
   status: active
   images: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"]
   is_featured: true
   rating_avg: 4.8
   rating_count: 24
   ```
4. Click **Save**

**Verify**: Refresh localhost:3000 → Product should appear!

---

### Step 10: Test Checkout Flow

1. On localhost:3000, click **Add to Cart** on your product
2. Click **Proceed to Checkout**
3. Use Stripe test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
4. Click **Pay**

**Verify in Terminal 1** (Stripe webhook):
```
✓ checkout.session.completed
```

**Verify in Supabase** → **orders** table → Should see new order with status "paid"

---

## ✅ Phase 3: Deploy to Production (30 minutes)

### Step 11: Push to GitHub

```bash
cd /home/romex/projects/warrior-marketplace

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - Warrior AI Marketplace MVP"

# Create GitHub repo at github.com/new
# Then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warrior-marketplace.git
git push -u origin main
```

---

### Step 12: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your GitHub repository
3. **Framework Preset**: Next.js (auto-detected)
4. Click **Environment Variables** → Add all from `.env.local` **EXCEPT**:
   - ❌ Skip `NODE_ENV`
   - ❌ Skip `NEXT_PUBLIC_APP_URL`
   - ❌ Skip `STRIPE_WEBHOOK_SECRET` (we'll add this next)
5. Click **Deploy**

**Wait for**: "Congratulations! Your project has been deployed."

---

### Step 13: Configure Production Webhook

1. Copy your Vercel deployment URL (e.g., `https://warrior-marketplace.vercel.app`)
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Endpoint URL: `https://warrior-marketplace.vercel.app/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
6. Click **Add endpoint**
7. Copy **Signing secret**: `whsec_...`
8. In Vercel → **Settings** → **Environment Variables**
9. Add:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_... (production secret)
   NEXT_PUBLIC_APP_URL = https://warrior-marketplace.vercel.app
   ```
10. Redeploy: **Deployments** → Latest → **⋯** → **Redeploy**

---

### Step 14: Test Production

1. Visit your Vercel URL
2. Add product to cart
3. Test checkout with Stripe test card
4. Verify order appears in Supabase

**Success!** 🎉 Your marketplace is live!

---

## ✅ Phase 4: Custom Domain (Optional, 20 minutes)

### Step 15: Add Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Add: `warrioraiautomations.com`
3. Vercel will show DNS records

---

### Step 16: Configure Cloudflare

1. Login to [Cloudflare](https://dash.cloudflare.com)
2. Add site: `warrioraiautomations.com`
3. Update nameservers at your domain registrar
4. In Cloudflare DNS:
   - **A Record**: `@` → `76.76.21.21` (Vercel IP)
   - **CNAME**: `www` → `cname.vercel-dns.com`
5. **SSL/TLS** → **Full (strict)**
6. **Always Use HTTPS** → ON

---

### Step 17: Add Secondary Domain Redirect

1. Add `warriorautomations.com` to Cloudflare
2. **Page Rules** → **Create Page Rule**
3. URL: `warriorautomations.com/*`
4. Setting: **Forwarding URL** → **301 Permanent Redirect**
5. Destination: `https://warrioraiautomations.com/$1`
6. **Save and Deploy**

---

### Step 18: Update Vercel Environment

1. Vercel → **Settings** → **Environment Variables**
2. Update:
   ```
   NEXT_PUBLIC_APP_URL = https://warrioraiautomations.com
   ```
3. Redeploy

---

### Step 19: Update Stripe Webhook URL

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click your production endpoint
3. Update URL to: `https://warrioraiautomations.com/api/webhooks/stripe`
4. **Update endpoint**

---

## ✅ Phase 5: Go Live (10 minutes)

### Step 20: Switch Stripe to Live Mode

**WARNING**: Only do this when ready to accept real payments!

1. In Stripe Dashboard, toggle **Live Mode** ON (top right)
2. Go to **Developers** → **API keys**
3. Get **Live** keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`
4. Update Vercel environment variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
   STRIPE_SECRET_KEY = sk_live_...
   ```
5. Create new webhook for live mode:
   - URL: `https://warrioraiautomations.com/api/webhooks/stripe`
   - Events: Same as before
   - Get new signing secret: `whsec_...`
6. Update in Vercel:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_... (live secret)
   ```
7. **Redeploy**

---

### Step 21: Final Checks

- [ ] Visit https://warrioraiautomations.com
- [ ] Homepage loads correctly
- [ ] Products display properly
- [ ] Add to cart works
- [ ] Checkout redirects to Stripe
- [ ] Complete test purchase
- [ ] Order appears in Supabase
- [ ] Check Terminal/Stripe Dashboard for webhook success

---

## 🎉 YOU'RE LIVE!

Your Warrior AI Marketplace is now accepting payments!

---

## 📊 Post-Launch Checklist

- [ ] Add remaining products to database
- [ ] Set up monitoring (UptimeRobot, Sentry)
- [ ] Configure email delivery (Resend)
- [ ] Import n8n workflows
- [ ] Write launch announcement
- [ ] Post on Product Hunt
- [ ] Share on Twitter, LinkedIn
- [ ] Email waitlist (if you have one)

---

## 🆘 Troubleshooting

**Webhook not working?**
- Check signing secret matches
- Verify endpoint URL is correct
- Check Stripe Dashboard → Webhooks → Attempted deliveries

**Build failing?**
- Run `npm run build` locally
- Check error message
- Verify all environment variables are set

**Database connection error?**
- Verify Supabase URL and keys
- Check if project is paused (free tier pauses after 7 days inactivity)

---

## 📞 Need Help?

- **Documentation**: README.md, SETUP_GUIDE.md
- **Quick Reference**: QUICK_REFERENCE.md
- **Email**: support@warrioraiautomations.com

---

**Time to first sale: 2 weeks → STARTING NOW! 🚀**

Good luck with your launch!
