# 🚀 Complete Warrior Marketplace Setup - Both Product Lines

**Created**: December 27, 2025
**Products**: MCP Marketplace (3 tiers) + AgentFlow Pro (3 tiers)
**Goal**: Launch YOUR marketplace TODAY - save 10% Gumroad commission!

---

## ✅ What's Ready

1. ✅ **Environment configured** (.env.local with Supabase + Stripe)
2. ✅ **Database schema** (7 tables created)
3. ✅ **Product SQL script** (6 products seeded to database)
4. ✅ **MCP packages ready** (3 .tar.gz files in ~/gumroad-products)
5. ✅ **Stripe integration** (checkout + webhooks API routes)
6. ✅ **Build tested** (app compiles successfully)
7. ✅ **Homepage** (Beautiful dark-mode with 2 product sections)
8. ✅ **Checkout page** (/checkout/[slug] with email form)
9. ✅ **Success page** (/order/success with confirmation)
10. ✅ **Supabase Storage bucket** (product-files bucket created)

---

## 📋 Setup Steps (30-45 minutes)

### STEP 1: Set Up Supabase Database (10 min)

**Option A: Quick Setup via Dashboard** (Recommended)

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Open your project**: `warrior-marketplace` (dhlhnhacvwylrdxdlnqs)
3. **Navigate to**: SQL Editor
4. **Run migrations** (paste and run each file):

   ```sql
   -- File 1: Initial Schema
   -- Copy from: supabase/migrations/20231201000000_initial_schema.sql
   -- Paste in SQL Editor → Click "Run"
   ```

   ```sql
   -- File 2: RLS Policies
   -- Copy from: supabase/migrations/20231201000001_rls_policies.sql
   -- Paste in SQL Editor → Click "Run"
   ```

   ```sql
   -- File 3: Database Functions
   -- Copy from: supabase/migrations/20231201000002_functions.sql
   -- Paste in SQL Editor → Click "Run"
   ```

5. **Verify**: Go to Table Editor → Should see 7 tables

**Option B: CLI Setup**

```bash
cd /home/romex/projects/warrior-marketplace
export PATH="$HOME/.local/bin:$PATH"

# Link to your Supabase project
supabase link --project-ref dhlhnhacvwylrdxdlnqs

# Run migrations
supabase db push
```

---

### STEP 2: Get Your Auth User ID (2 min)

1. **Go to**: Supabase Dashboard → Authentication → Users
2. **Create test user** (or use existing):
   - Email: `rome@warrioraiautomations.com`
   - Password: (choose strong password)
3. **Copy the UUID** (something like: `a1b2c3d4-...`)
4. **Save it** - you'll need it in Step 3

---

### STEP 3: Add Products to Database (5 min)

1. **Edit** `scripts/add-products.sql`:
   ```bash
   nano /home/romex/projects/warrior-marketplace/scripts/add-products.sql
   ```

2. **Replace this line** (appears twice - line 16 and in each product):
   ```sql
   '00000000-0000-0000-0000-000000000001'::UUID
   ```

   **With your actual user ID** from Step 2:
   ```sql
   'YOUR-ACTUAL-UUID-HERE'::UUID
   ```

3. **Save and exit**: Ctrl+X, Y, Enter

4. **Run in Supabase**:
   - Go to: SQL Editor
   - Copy entire contents of `scripts/add-products.sql`
   - Paste → Click "Run"
   - **Verify**: Should see "6 rows" returned showing all products

---

### STEP 4: Upload MCP Packages to Supabase Storage (10 min)

1. **Go to**: Supabase Dashboard → Storage
2. **Create bucket**:
   - Name: `product-files`
   - Public: ✅ Checked (customers need to download)
   - Click "Create bucket"

3. **Upload files**:
   - Click on `product-files` bucket
   - Click "Upload file"
   - Upload `/home/romex/gumroad-products/mcp-starter-pack.tar.gz`
   - Repeat for: `mcp-pro-pack.tar.gz`, `mcp-agency-suite.tar.gz`

4. **Get download URLs**:
   - Click each file → Click "Get URL" → Copy
   - You'll get URLs like:
     `https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/product-files/mcp-starter-pack.tar.gz`

5. **Update products table**:
   ```sql
   -- Run this in SQL Editor
   UPDATE products
   SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/product-files/mcp-starter-pack.tar.gz'
   WHERE slug = 'mcp-starter-pack';

   UPDATE products
   SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/product-files/mcp-pro-pack.tar.gz'
   WHERE slug = 'mcp-pro-pack';

   UPDATE products
   SET download_url = 'https://dhlhnhacvwylrdxdlnqs.supabase.co/storage/v1/object/public/product-files/mcp-agency-suite.tar.gz'
   WHERE slug = 'mcp-agency-suite';
   ```

---

### STEP 5: Start Development Server (2 min)

```bash
cd /home/romex/projects/warrior-marketplace
npm run dev
```

**Visit**: http://localhost:3000

**You should see**: Your marketplace homepage (currently basic, we'll enhance it next)

---

### STEP 6: Set Up Stripe Webhooks (5 min)

**Terminal 2** (keep dev server running in Terminal 1):

```bash
cd /home/romex/projects/warrior-marketplace

# Install Stripe CLI if not installed
# (Skip if already installed)
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Copy the webhook secret** (starts with `whsec_`):
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Update .env.local**:
```bash
# Replace this line:
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_THIS_AFTER_STRIPE_LISTEN

# With your actual secret:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Restart dev server** (Ctrl+C in Terminal 1, then `npm run dev`)

---

### STEP 7: Test Checkout Flow (5 min)

1. **Open**: http://localhost:3000
2. **Browse products**: Should see all 6 products
3. **Click "Buy Now"** on any product
4. **Use test card**:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
5. **Complete checkout**
6. **Verify**:
   - Terminal 2 (webhook listener) shows webhook received
   - Supabase Dashboard → orders table has new order
   - Email sent (if configured)

---

## ● **Learn by Doing**

**Context**: I've set up the database structure and product data, but the homepage currently shows a basic template. The real value comes when customers can actually SEE and BUY your products. You need to decide how to present two distinct product lines (MCP Marketplace vs AgentFlow Pro) in a way that's clear and compelling.

**Your Task**: In `/home/romex/projects/warrior-marketplace/app/page.tsx`, implement the product display logic. Look for `TODO(human)` comment I'll add. You need to:
1. Fetch products from Supabase (categorized by product line)
2. Create two sections: "MCP Marketplace" and "AgentFlow Pro"
3. Display product cards with pricing, descriptions, and "Buy Now" buttons
4. Link to Stripe checkout for paid products, direct download for free

**Guidance**: Consider these approaches:
- **Tabs**: Use Radix UI tabs to switch between product lines
- **Sections**: Scroll down to see both product lines on one page
- **Separate pages**: `/mcp` and `/agentflow` routes

Trade-offs:
- Tabs = clean, but might hide products
- Sections = shows everything, but might feel cluttered
- Separate pages = best organization, but requires routing setup

The `db` import from `@/lib/db` is already available. Products table has `category` field to filter by. Use the existing `ProductCard` component at `components/product/ProductCard.tsx` for consistency.

---

## 🎯 What You'll Have After Setup

✅ **6 Live Products**:
- MCP Starter Pack (FREE)
- MCP Pro Pack ($9/mo)
- MCP Agency Suite ($29/mo)
- AgentFlow Starter ($29/mo)
- AgentFlow Professional ($79/mo)
- AgentFlow Agency ($199/mo)

✅ **Full E-commerce Flow**:
- Product listings
- Stripe checkout
- Order tracking
- Download delivery (for MCP products)

✅ **Zero Commission**:
- Gumroad would take 10% = $1,000 on $10K revenue
- Your marketplace = $0 commission
- **You save $12,000/year at $10K/mo revenue**

---

## 🚀 Next Steps After Setup

### Immediate (Today)
- [x] **DONE**: Implement product display on homepage ✅
- [ ] Add product images/covers (optional - cards look great without them)
- [ ] Test complete purchase flow
- [ ] Set up email delivery (Resend integration)

### This Week
- [ ] Deploy to Vercel
- [ ] Configure custom domain (warrioraiautomations.com)
- [ ] Switch Stripe to live mode
- [ ] Announce launch

### Marketing
- [ ] Product Hunt launch
- [ ] Twitter/LinkedIn announcement
- [ ] Email your list
- [ ] Share in Claude Code Discord

---

## 📊 Revenue Comparison

**Scenario**: $10,000/month revenue

| Platform | Commission | Stripe Fees | Total Fees | You Keep |
|----------|-----------|-------------|------------|----------|
| **Gumroad** | $1,000 (10%) | $290 (2.9%) | **$1,290** | $8,710 |
| **Your Marketplace** | $0 | $290 (2.9%) | **$290** | $9,710 |
| **Savings** | - | - | **$1,000/mo** | **+$12K/year** |

---

## 🛠️ Troubleshooting

**Products not showing?**
- Check: Supabase Dashboard → Table Editor → products (should have 6 rows)
- Verify: `status = 'active'` for all products

**Checkout not working?**
- Check: Stripe Dashboard → Developers → Webhooks
- Verify: `whsec_` secret in .env.local matches webhook listener

**Downloads not working?**
- Check: Supabase Storage → product-files (3 .tar.gz files)
- Verify: `download_url` in products table is correct

**Build errors?**
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Support

**Issues?** Check these files:
- `README.md` - Overview
- `SETUP_GUIDE.md` - Original setup guide
- `DATABASE_SETUP_INSTRUCTIONS.md` - Database help
- `LAUNCH_CHECKLIST.md` - Pre-launch tasks

---

**Ready to launch! 🚀** Follow the steps above and you'll have a fully functional marketplace in 30-45 minutes.

*Rome Guerrero | Warrior AI Automations*
*Your marketplace, your rules, your revenue.*
