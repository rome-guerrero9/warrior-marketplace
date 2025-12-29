# ⚡ QUICK START GUIDE - Warrior Marketplace
**Get your marketplace live in 30 minutes**

**Products Ready**: 6 total (3 MCP Servers + 3 AgentFlow Pro)
**Status**: All files packaged and ready
**Goal**: Launch TODAY with both product lines

---

## 🎯 WHAT YOU'RE LAUNCHING

### MCP Server Marketplace
- **FREE**: Starter Pack (3 servers)
- **$9/mo**: Pro Pack (10 servers)
- **$29/mo**: Agency Suite (Unlimited + Kali Security)

### AgentFlow Pro SaaS
- **$29/mo**: Starter (5 clients, basic features)
- **$79/mo**: Professional (25 clients, advanced automation) - MOST POPULAR
- **$199/mo**: Agency (Unlimited, enterprise features)

---

## 🚀 SETUP (4 SIMPLE STEPS - 30 MIN)

### ✅ STEP 1: Run Database Migrations (10 min)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `warrior-marketplace`
3. Go to **SQL Editor** → **New Query**
4. Run these 4 SQL files in order:

**File 1**: Copy/paste `/home/romex/projects/warrior-marketplace/supabase/migrations/20231201000000_initial_schema.sql`
- Click **RUN** → Wait for "Success"

**File 2**: Copy/paste `/home/romex/projects/warrior-marketplace/supabase/migrations/20231201000001_rls_policies.sql`
- Click **RUN** → Wait for "Success"

**File 3**: Copy/paste `/home/romex/projects/warrior-marketplace/supabase/migrations/20231201000002_functions.sql`
- Click **RUN** → Wait for "Success"

**File 4**: Copy/paste `/home/romex/projects/warrior-marketplace/scripts/setup-vendor-and-products.sql`
- Click **RUN** → You should see a table with 6 products!

5. Verify: Go to **Table Editor** → **products** → Should see 6 rows ✅

---

### ✅ STEP 2: Upload MCP Packages to Storage (10 min)

**Option A: Automated Script (Recommended)**

```bash
cd /home/romex/projects/warrior-marketplace
npm install dotenv @supabase/supabase-js
node scripts/upload-to-storage.js
```

The script will:
- Create `products` bucket in Supabase Storage
- Upload all 3 MCP .tar.gz files
- Update download URLs in database automatically
- Show success confirmation

**Option B: Manual Upload via Dashboard**

1. Go to Supabase Dashboard → **Storage**
2. Create bucket: `products` (Public bucket ✅)
3. Create folder: `downloads`
4. Upload these 3 files:
   - `/home/romex/gumroad-products/mcp-starter-pack.tar.gz`
   - `/home/romex/gumroad-products/mcp-pro-pack.tar.gz`
   - `/home/romex/gumroad-products/mcp-agency-suite.tar.gz`
5. Copy public URLs for each file
6. Run this SQL to update URLs:

```sql
UPDATE products SET download_url = 'YOUR_STARTER_PACK_URL' WHERE slug = 'mcp-starter-pack';
UPDATE products SET download_url = 'YOUR_PRO_PACK_URL' WHERE slug = 'mcp-pro-pack';
UPDATE products SET download_url = 'YOUR_AGENCY_SUITE_URL' WHERE slug = 'mcp-agency-suite';
```

---

### ✅ STEP 3: Start Development Server (2 min)

```bash
cd /home/romex/projects/warrior-marketplace
npm run dev
```

Open: http://localhost:3000

**You should see**: Homepage with 6 products! 🎉

---

### ✅ STEP 4: Test Checkout (8 min)

#### Test 1: MCP Product Purchase (Digital Download)

1. Click on **"MCP Pro Pack - $9"**
2. Click **"Add to Cart"**
3. Click **"Proceed to Checkout"**
4. Enter Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
5. Complete checkout
6. **Verify**: Check Supabase → **orders** table → New order with status "paid" ✅

#### Test 2: AgentFlow Pro Subscription

1. Click on **"AgentFlow Pro - Starter - $29"**
2. Click **"Subscribe Now"** or **"Buy Now"**
3. Should redirect to Stripe payment link
4. Complete checkout with test card
5. **Verify**: Stripe Dashboard → Subscriptions → New subscription ✅

---

## 🎉 THAT'S IT! YOU'RE LIVE!

Your marketplace is now:
- ✅ Accepting payments
- ✅ Delivering digital downloads
- ✅ Processing subscriptions
- ✅ Ready for customers

---

## 🔥 OPTIONAL: Stripe Webhooks for Local Testing

If you want to test webhook events locally:

**Terminal 1** (Keep running):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

Restart dev server.

---

## 🚀 DEPLOY TO PRODUCTION (Bonus - 20 min)

Once local testing works, deploy to Vercel:

### 1. Push to GitHub
```bash
git add .
git commit -m "Launch Warrior Marketplace with 6 products"
git push origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add environment variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
4. Click **Deploy**

### 3. Set Up Production Webhook
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook secret
5. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`
6. Redeploy

### 4. Switch to Live Mode (When Ready for Real Payments)
1. Toggle Stripe to **Live Mode**
2. Get live API keys
3. Update Vercel environment variables with live keys
4. Create new webhook for live mode
5. Test with real card (then refund)
6. You're LIVE! 🚀

---

## 📊 WHAT'S INCLUDED

### Files Created:
```
warrior-marketplace/
├── supabase/migrations/
│   ├── 20231201000000_initial_schema.sql (7 tables)
│   ├── 20231201000001_rls_policies.sql (security)
│   ├── 20231201000002_functions.sql (triggers)
│   └── 20231201000003_add_products.sql (6 products)
├── scripts/
│   ├── setup-vendor-and-products.sql (all-in-one setup)
│   └── upload-to-storage.js (automated file upload)
├── PRODUCT_SETUP_COMPLETE.md (detailed guide)
├── QUICK_START_GUIDE.md (this file)
└── .env.local (your credentials)
```

### Products in Database:
```
1. MCP Starter Pack - FREE (slug: mcp-starter-pack)
2. MCP Pro Pack - $9/mo (slug: mcp-pro-pack)
3. MCP Agency Suite - $29/mo (slug: mcp-agency-suite)
4. AgentFlow Pro Starter - $29/mo (slug: agentflow-pro-starter)
5. AgentFlow Pro Professional - $79/mo (slug: agentflow-pro-professional)
6. AgentFlow Pro Agency - $199/mo (slug: agentflow-pro-agency)
```

### MCP Packages Ready:
```
/home/romex/gumroad-products/
├── mcp-starter-pack.tar.gz (5.4 KB)
├── mcp-pro-pack.tar.gz (5.8 KB)
└── mcp-agency-suite.tar.gz (5.9 KB)
```

---

## 🆘 TROUBLESHOOTING

### "Build Error" when running npm run dev?
```bash
rm -rf .next
npm run build
npm run dev
```

### "Products not showing on homepage"?
- Check: `SELECT COUNT(*) FROM products WHERE status = 'active';` in SQL Editor
- Should return 6
- If 0, re-run Step 1, File 4

### "Stripe checkout not working"?
- Verify `.env.local` has correct Stripe test keys
- Check browser console for errors
- Verify API route exists: `/app/api/checkout/route.ts`

### "Download links broken"?
- Verify files uploaded to Storage: Supabase → Storage → products/downloads
- Check bucket is PUBLIC
- Test URL directly in browser

---

## 📞 NEED HELP?

**Documentation**:
- Full Setup: `PRODUCT_SETUP_COMPLETE.md`
- Main README: `README.md`
- Database Schema: `supabase/migrations/20231201000000_initial_schema.sql`

**Quick Checks**:
```bash
# Verify build
npm run build

# Check database connection
# (Will create if needed)
npm install tsx dotenv
npx tsx scripts/check-database.ts

# Verify environment variables
cat .env.local | grep -v "^#" | grep "="
```

---

## 🎯 SUCCESS CHECKLIST

After completing all steps, verify:

- [ ] 4 SQL migrations ran successfully
- [ ] 6 products exist in `products` table
- [ ] 3 MCP files uploaded to Supabase Storage
- [ ] Dev server runs: `npm run dev`
- [ ] Homepage displays 6 products
- [ ] Can add product to cart
- [ ] Stripe checkout works
- [ ] Test purchase creates order in database
- [ ] MCP product download works
- [ ] AgentFlow Pro redirects to Stripe payment link

---

## 🌟 REVENUE POTENTIAL

### Conservative Week 1 Projections:
- MCP FREE downloads: 50-100 (email list building)
- MCP Pro ($9/mo): 3-5 subscribers = $27-45 MRR
- MCP Agency ($29/mo): 1-2 subscribers = $29-58 MRR
- AgentFlow Starter ($29/mo): 2-3 subscribers = $58-87 MRR
- AgentFlow Pro ($79/mo): 1-2 subscribers = $79-158 MRR
- AgentFlow Agency ($199/mo): 0-1 subscribers = $0-199 MRR

**Total Week 1 MRR**: $193-547

**Month 1 Goal**: $1,000-2,000 MRR

---

## 🚀 NEXT STEPS AFTER LAUNCH

1. **Marketing** (Day 1):
   - Tweet about launch
   - Post on Product Hunt
   - Share in Claude Code communities
   - Email your list

2. **Optimization** (Week 1):
   - A/B test product descriptions
   - Add customer testimonials
   - Create demo videos
   - Improve product images

3. **Growth** (Month 1):
   - Add more MCP servers to Pro/Agency tiers
   - Build AgentFlow Pro features
   - Launch affiliate program
   - Create content marketing

---

**Time to complete setup**: 30-45 minutes
**Time to first sale**: Hours, not weeks
**Gumroad commission saved**: 10% = $100-200/month

**Let's launch! 🚀**

---

*Rome Guerrero | Warrior AI Automations*
*Built with Claude Code | 2025-12-27*
