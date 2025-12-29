# 🚀 Marketplace Launch - Quick Recovery Guide

## ✅ What You've Already Done

1. ✅ **Initial Schema** - Already exists in database
2. ✅ **Product Catalog** - 3 products loaded (MCP Starter, Pro, Agency)
3. ❌ **RLS Policies** - Syntax errors prevented execution
4. ❌ **Database Functions** - Syntax errors prevented execution

## 🎯 What's Next (30 minutes to launch)

### Step 1: Verify Current Database State (2 minutes)

**Go to Supabase Dashboard** → SQL Editor → New Query

```sql
-- Paste and run this entire verification script:
```

Copy the contents of `/home/romex/projects/warrior-marketplace/scripts/verify-database-setup.sql` and run it.

**Expected Output**:
- ✅ 7 tables exist (profiles, products, orders, etc.)
- ✅ 3 products in database
- ⚠️ Policies might be missing or incomplete
- ⚠️ Functions might be missing

---

### Step 2: Set Up RLS Policies (5 minutes)

**In Supabase SQL Editor** → New Query

```sql
-- Paste and run this entire simplified RLS script:
```

Copy the contents of `/home/romex/projects/warrior-marketplace/scripts/setup-rls-simple.sql` and run it.

**This sets up the MINIMUM policies needed** for:
- Public product viewing
- Order creation via API
- Download management
- Review visibility

**If you get "policy already exists" errors**, that's OKAY! It means some policies are already there.

---

### Step 3: Set Up Essential Functions (3 minutes)

**In Supabase SQL Editor** → New Query

```sql
-- Paste and run this entire simplified functions script:
```

Copy the contents of `/home/romex/projects/warrior-marketplace/scripts/setup-functions-simple.sql` and run it.

**This creates**:
- `generate_order_number()` - Creates unique order IDs
- `search_products()` - Basic product search

**If you get "function already exists"**, that's OKAY! The `CREATE OR REPLACE` will update it.

---

### Step 4: Upload Product Files to Storage (5 minutes)

**Two Options:**

#### Option A: Automated Script (Recommended)
```bash
cd /home/romex/projects/warrior-marketplace

# Install dependencies if needed
npm install dotenv @supabase/supabase-js

# Run upload script
node scripts/upload-to-storage.js
```

**Expected Output**:
```
✅ Created 'products' bucket
✅ Uploaded mcp-starter-pack.tar.gz
✅ Uploaded mcp-pro-pack.tar.gz
✅ Uploaded mcp-agency-suite.tar.gz
✅ All files uploaded successfully!
```

#### Option B: Manual Upload (If script fails)
1. Go to Supabase Dashboard → Storage
2. Create new bucket called "products" (public)
3. Upload these 3 files from `/home/romex/gumroad-products/`:
   - mcp-starter-pack.tar.gz
   - mcp-pro-pack.tar.gz
   - mcp-agency-suite.tar.gz

---

### Step 5: Test Locally (5 minutes)

```bash
cd /home/romex/projects/warrior-marketplace

# Start development server
npm run dev
```

**Visit**: http://localhost:3000

**What to Check**:
- ✅ Homepage loads
- ✅ 6 products displayed (3 MCP + 3 AgentFlow)
- ✅ Product cards show prices correctly
- ✅ Click "Get Started" on a paid product → Checkout page loads
- ✅ FREE products show "Download Now" button

**Test Checkout** (use Stripe test card):
- Card: 4242 4242 4242 4242
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Email: your-test@email.com

**Expected**: Redirects to success page, order created in database

---

### Step 6: Deploy to Vercel (15 minutes)

#### A. Initialize Git (if not done)
```bash
cd /home/romex/projects/warrior-marketplace

git init
git add .
git commit -m "feat: Launch Warrior Marketplace with 6 products"
```

#### B. Create GitHub Repository
```bash
# Using GitHub CLI (if installed)
gh repo create warrior-marketplace --private --source=. --push

# OR manually:
# 1. Go to github.com/new
# 2. Create "warrior-marketplace" (private)
# 3. Follow instructions to push existing repo
```

#### C. Deploy to Vercel
1. **Go to**: https://vercel.com
2. **Click**: "Add New..." → "Project"
3. **Import**: Select your warrior-marketplace repo
4. **Configure**:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

5. **Environment Variables** - Add these from `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dhlhnhacvwylrdxdlnqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your pk_test key]
STRIPE_SECRET_KEY=[your sk_test key]
STRIPE_WEBHOOK_SECRET=[your whsec key]

# App
NEXT_PUBLIC_APP_URL=https://warrior-marketplace.vercel.app
NODE_ENV=production

# Email (optional for now)
RESEND_FROM_EMAIL=noreply@warrioraiautomations.com

# AI APIs (optional for now)
ANTHROPIC_API_KEY=[your key]
OPENAI_API_KEY=[your key]
```

6. **Click**: "Deploy"

**Build time**: ~2 minutes

**After Deploy**:
- ✅ Visit your live URL (e.g., `warrior-marketplace.vercel.app`)
- ✅ Test checkout with real Stripe test mode
- ✅ Verify order appears in Supabase

---

### Step 7: Configure Custom Domain (Optional - 10 minutes)

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain**: `warrioraiautomations.com`
3. **Add DNS Records** (at your domain registrar):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Wait**: DNS propagation (5-48 hours)

---

## 🎉 YOU'RE LIVE!

After completing these steps:
- ✅ Marketplace is live and accepting payments
- ✅ 6 products available (3 free downloads + 3 subscriptions)
- ✅ Stripe processing payments in test mode
- ✅ Orders saving to Supabase
- ✅ Downloads working automatically

---

## 🔧 Troubleshooting

### "RLS policy already exists"
**Solution**: Safe to ignore. Some policies may have been created by the first attempt.

### "Function already exists"
**Solution**: Safe to ignore. The `CREATE OR REPLACE` will update it.

### Products not showing on homepage
**Check**:
1. Run verification script - are products in database?
2. Check Supabase → Table Editor → products (should see 3 rows)
3. Check `.env.local` - are Supabase keys correct?

### Upload script fails
**Solution**: Use Manual Upload (Option B in Step 4)

### Checkout fails
**Check**:
1. Stripe keys in `.env.local` correct?
2. Are they TEST keys (pk_test_ and sk_test_)?
3. Check browser console for errors

### Build fails on Vercel
**Check**:
1. All environment variables added?
2. Build works locally? (`npm run build`)
3. Check Vercel build logs for specific error

---

## 📊 Post-Launch Checklist

After you're live:

- [ ] Test full checkout flow with test card
- [ ] Verify email received (check spam)
- [ ] Check order appears in Supabase dashboard
- [ ] Test download links work
- [ ] Try all 3 MCP products downloads
- [ ] Test AgentFlow subscription redirects
- [ ] Monitor Vercel logs for errors
- [ ] Set up Stripe webhooks for production
- [ ] Switch to Stripe production keys when ready

---

## 🚀 Next Steps After Launch

1. **Marketing**: Share on Twitter, LinkedIn, Product Hunt
2. **Analytics**: Add Google Analytics or Plausible
3. **SEO**: Submit sitemap, optimize meta tags
4. **Content**: Write blog posts about your MCP servers
5. **Growth**: Email list, testimonials, case studies

---

## 💰 Expected Results

**Week 1**:
- 50-100 FREE downloads (list building)
- 3-5 paid subscribers ($27-$135 MRR)

**Month 1**:
- $1,000-$2,000 MRR
- 200-300 email subscribers

**Quarter 1**:
- $5,000+ MRR
- Profitable, self-sustaining

---

**You're ~30 minutes from your first sale.**

Let's get this done! 🚀
