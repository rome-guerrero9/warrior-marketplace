# ✅ Warrior Marketplace - Product Setup Complete

**Status**: Ready to Deploy
**Date**: December 27, 2025
**Products**: 6 total (3 MCP + 3 AgentFlow Pro)

---

## 📦 PRODUCTS ADDED

### MCP Server Packages (3 Tiers)

**1. MCP Starter Pack - FREE**
- Price: $0 (FREE)
- Slug: `mcp-starter-pack`
- Category: MCP Servers
- Download: `mcp-starter-pack.tar.gz`
- Features: 3 essential servers (Project Health Auditor, Workflow Orchestrator, Domain Memory Agent)

**2. MCP Pro Pack - $9/month**
- Price: $9/month
- Slug: `mcp-pro-pack`
- Category: MCP Servers
- Download: `mcp-pro-pack.tar.gz`
- Features: 10 professional servers including Design to Code, API Debugger, etc.

**3. MCP Agency Suite - $29/month**
- Price: $29/month
- Slug: `mcp-agency-suite`
- Category: MCP Servers
- Download: `mcp-agency-suite.tar.gz`
- Features: Unlimited servers + exclusive Kali Security Suite

### AgentFlow Pro Subscriptions (3 Tiers)

**4. AgentFlow Pro - Starter - $29/month**
- Price: $29/month
- Slug: `agentflow-pro-starter`
- Category: SaaS
- Stripe Link: https://buy.stripe.com/test_4gMbJ0fNQ5Gl3nUd1C9Zm03
- Features: 5 clients, 10 projects, white-label portal

**5. AgentFlow Pro - Professional - $79/month**
- Price: $79/month
- Slug: `agentflow-pro-professional`
- Category: SaaS
- Stripe Link: https://buy.stripe.com/test_eVqaEW7hk2u98Ie1iU9Zm04
- Features: 25 clients, unlimited projects, advanced automation

**6. AgentFlow Pro - Agency - $199/month**
- Price: $199/month
- Slug: `agentflow-pro-agency`
- Category: SaaS
- Stripe Link: https://buy.stripe.com/test_9B6eVcdFI3ydf6C6De9Zm05
- Features: Unlimited clients, dedicated support, enterprise features

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Run Database Migrations

You need to run the migrations in order. Choose one of these methods:

#### Method A: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: `warrior-marketplace`
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of each migration file in order:

   **Migration 1: Initial Schema**
   ```bash
   # Copy contents from:
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000000_initial_schema.sql
   ```
   Click **Run** → Should see "Success"

   **Migration 2: RLS Policies**
   ```bash
   # Copy contents from:
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000001_rls_policies.sql
   ```
   Click **Run** → Should see "Success"

   **Migration 3: Functions**
   ```bash
   # Copy contents from:
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000002_functions.sql
   ```
   Click **Run** → Should see "Success"

   **Migration 4: Add Products**
   ```bash
   # Copy contents from:
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000003_add_products.sql
   ```
   Click **Run** → Should see list of 6 products!

5. Verify in **Table Editor** → **products** → Should see 6 rows

#### Method B: Via Supabase CLI

```bash
export PATH="$HOME/.local/bin:$PATH"
cd /home/romex/projects/warrior-marketplace

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref dhlhnhacvwylrdxdlnqs

# Push migrations in order
supabase db push --file supabase/migrations/20231201000000_initial_schema.sql
supabase db push --file supabase/migrations/20231201000001_rls_policies.sql
supabase db push --file supabase/migrations/20231201000002_functions.sql
supabase db push --file supabase/migrations/20231201000003_add_products.sql
```

---

### Step 2: Upload MCP Package Files to Supabase Storage

The MCP `.tar.gz` files need to be uploaded to Supabase Storage for download delivery.

#### Via Supabase Dashboard:

1. Go to https://supabase.com/dashboard → Your Project
2. Click **Storage** in sidebar
3. Create a new bucket called `products`
4. Settings:
   - Public bucket: ✅ YES
   - File size limit: 50MB
   - Allowed MIME types: application/gzip, application/x-tar
5. Click **Create bucket**
6. Click on `products` bucket
7. Create folder: `downloads`
8. Upload files:
   - Click **Upload File**
   - Select `/home/romex/gumroad-products/mcp-starter-pack.tar.gz`
   - Upload to `downloads/` folder
   - Repeat for:
     - `mcp-pro-pack.tar.gz`
     - `mcp-agency-suite.tar.gz`

9. Get public URLs:
   - Click on each uploaded file
   - Copy the public URL
   - Should look like: `https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-starter-pack.tar.gz`

10. Update product download URLs in database:

```sql
-- Update download URLs with actual Supabase Storage URLs
UPDATE products
SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-starter-pack.tar.gz'
WHERE slug = 'mcp-starter-pack';

UPDATE products
SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-pro-pack.tar.gz'
WHERE slug = 'mcp-pro-pack';

UPDATE products
SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/products/downloads/mcp-agency-suite.tar.gz'
WHERE slug = 'mcp-agency-suite';
```

---

### Step 3: Create Vendor Profile

The products reference a vendor. You need to create your user account:

#### Option A: Via Supabase Auth

1. Start the dev server (Step 4)
2. Implement a signup page or use Supabase Auth UI
3. Sign up with `rome@warrioraiautomations.com`
4. Get your user ID from **Authentication** → **Users** in Supabase Dashboard
5. Update products with your real vendor_id:

```sql
-- Replace with your actual user UUID from auth.users
UPDATE products
SET vendor_id = 'YOUR_ACTUAL_USER_UUID'
WHERE vendor_id = 'a0000000-0000-0000-0000-000000000001';
```

#### Option B: Quick Test (Skip for now)
The placeholder vendor_id will work for testing. You can update it later.

---

### Step 4: Start Development Server

```bash
cd /home/romex/projects/warrior-marketplace
npm run dev
```

Open http://localhost:3000

**Expected**: Homepage loads with 6 products displayed!

---

### Step 5: Test Checkout Flow

#### For MCP Products (Digital Downloads):
1. Click on "MCP Pro Pack" ($9)
2. Click **Add to Cart**
3. Click **Proceed to Checkout**
4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
5. Complete checkout
6. Verify you get redirected to success page
7. Check Supabase → **orders** table → New order with status "paid"
8. Check Supabase → **downloads** table → Download link created

#### For AgentFlow Pro (Subscriptions):
1. Click on "AgentFlow Pro - Starter" ($29)
2. Click **Subscribe Now**
3. Should redirect to existing Stripe payment link
4. Complete checkout with test card
5. Verify subscription created in Stripe Dashboard

---

### Step 6: Set Up Stripe Webhooks (for local testing)

**Terminal 1** (keep running):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret and update `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Restart dev server.

---

## ✅ VERIFICATION CHECKLIST

After completing setup, verify:

- [ ] All 4 migrations ran successfully
- [ ] 6 products exist in `products` table
- [ ] 3 MCP `.tar.gz` files uploaded to Supabase Storage
- [ ] Download URLs updated in database
- [ ] Dev server starts without errors
- [ ] Homepage displays all 6 products
- [ ] Can add MCP product to cart
- [ ] Can add AgentFlow Pro to cart
- [ ] Stripe checkout works with test card
- [ ] Order created in database after payment
- [ ] Download link generated for MCP products
- [ ] Stripe webhook receives events

---

## 📊 EXPECTED RESULTS

### Database Tables:
```
profiles: 1 row (your vendor account)
products: 6 rows (3 MCP + 3 AgentFlow Pro)
orders: 0 rows initially (increases after test purchases)
order_items: 0 rows initially
downloads: 0 rows initially (auto-created after MCP purchases)
reviews: 0 rows initially
carts: 0 rows initially
```

### Storage:
```
products/downloads/
  - mcp-starter-pack.tar.gz (5.4KB)
  - mcp-pro-pack.tar.gz (5.8KB)
  - mcp-agency-suite.tar.gz (5.9KB)
```

### Homepage Display:
```
Featured Products (6 total):
1. MCP Starter Pack - FREE
2. MCP Pro Pack - $9.00
3. MCP Agency Suite - $29.00
4. AgentFlow Pro - Starter - $29.00
5. AgentFlow Pro - Professional - $79.00 (Most Popular)
6. AgentFlow Pro - Agency - $199.00
```

---

## 🚀 NEXT STEPS AFTER SETUP

### Immediate (Same Day):
1. Test complete purchase flow for each product
2. Verify download delivery works for MCP products
3. Verify Stripe payment links work for AgentFlow Pro
4. Update product images (replace Unsplash placeholders)
5. Write custom product thumbnails/covers

### Short-term (This Week):
1. Deploy to Vercel production
2. Set up production Stripe webhook
3. Configure custom domain (warrioraiautomations.com)
4. Add product details pages
5. Implement download delivery system
6. Set up order confirmation emails

### Medium-term (Next 2 Weeks):
1. Add more products to marketplace
2. Implement user dashboard
3. Add reviews and ratings
4. Set up abandoned cart recovery
5. Launch marketing campaign
6. First customer sale!

---

## 🆘 TROUBLESHOOTING

### Products not showing on homepage?
- Check database: `SELECT * FROM products WHERE status = 'active';`
- Verify `.env.local` has correct Supabase credentials
- Restart dev server
- Check browser console for errors

### Stripe checkout not working?
- Verify Stripe test keys in `.env.local`
- Check that Stripe webhook is running (Terminal 1)
- Look for webhook events in Stripe Dashboard
- Check API route: `/app/api/checkout/route.ts`

### Downloads not working?
- Verify files uploaded to Supabase Storage `products/downloads/`
- Check Storage bucket is PUBLIC
- Verify download URLs in products table
- Test URL directly in browser

### Build errors?
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## 📞 SUPPORT

**Documentation**:
- Main README: `/home/romex/projects/warrior-marketplace/README.md`
- Setup Guide: `/home/romex/projects/warrior-marketplace/SETUP_GUIDE.md`
- Launch Checklist: `/home/romex/projects/warrior-marketplace/LAUNCH_CHECKLIST.md`

**Database Schema**: `/home/romex/projects/warrior-marketplace/supabase/migrations/20231201000000_initial_schema.sql`

**Product Files**: `/home/romex/gumroad-products/`

---

## 🎯 SUCCESS METRICS

**Definition of "COMPLETE"**:
- ✅ 6 products in database
- ✅ 3 MCP files in storage
- ✅ Dev server runs successfully
- ✅ All products display on homepage
- ✅ Checkout flow works end-to-end
- ✅ Downloads delivered automatically
- ✅ Subscriptions created in Stripe

**Time to Complete Setup**: 30-45 minutes

**Time to First Test Sale**: 60 minutes total

---

**You're ready to launch Warrior AI Marketplace!** 🚀

*Last updated: 2025-12-27 by Claude (Warrior AI Automations)*
