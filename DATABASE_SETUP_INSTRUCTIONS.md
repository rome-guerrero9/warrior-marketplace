# 🗄️ Database Setup Instructions

**Status**: ✅ Dependencies installed, ✅ Build successful, ⚠️ Database setup needed

---

## ⚡ OPTION 1: Automated Setup (Recommended - 5 minutes)

### Step 1: Authenticate with Supabase

```bash
# Make sure Supabase CLI is in your PATH
export PATH="$HOME/.local/bin:$PATH"

# Login (will open browser)
supabase login
```

**What happens:**
- Browser will open to https://supabase.com
- Log in with your Supabase account
- Grant access to the CLI
- Return to terminal when done

### Step 2: Link to Your Project

```bash
supabase link --project-ref dhlhnhacvwylrdxdlnqs
```

**What happens:**
- Connects CLI to your specific Supabase project
- Verifies you have access
- Creates local configuration

### Step 3: Run Migrations

```bash
# Migration 1: Create tables (profiles, products, orders, etc.)
supabase db push --file supabase/migrations/20231201000000_initial_schema.sql

# Migration 2: Enable Row-Level Security
supabase db push --file supabase/migrations/20231201000001_rls_policies.sql

# Migration 3: Add database functions
supabase db push --file supabase/migrations/20231201000002_functions.sql
```

**What happens:**
- Creates 7 database tables
- Sets up security policies
- Adds helper functions
- Enables real-time subscriptions

### Step 4: Verify Setup

```bash
supabase db dump --schema public | grep "CREATE TABLE" | wc -l
```

**Expected output:** `7` (or more)

### Step 5: (Optional) Add Sample Product

```bash
supabase db execute <<EOF
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    original_price_cents,
    category,
    status,
    images,
    is_featured,
    rating_avg,
    rating_count
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'AI Automation Starter Pack',
    'ai-automation-starter-pack',
    '10 production-ready n8n workflow templates, RAG system blueprints, and 50+ battle-tested Claude prompts.',
    4900,
    9900,
    'Automation',
    'active',
    ARRAY['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
    true,
    4.8,
    24
);
EOF
```

---

## 📊 OPTION 2: Manual Setup via Supabase Dashboard (10 minutes)

If you prefer to use the Supabase web interface:

### Step 1: Open SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **dhlhnhacvwylrdxdlnqs**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Migration 1 (Initial Schema)

Copy and paste the entire contents of:
```
supabase/migrations/20231201000000_initial_schema.sql
```

Click **Run** (or press Cmd/Ctrl + Enter)

**Expected result:**
```
Success. No rows returned
```

### Step 3: Run Migration 2 (Security Policies)

Copy and paste the entire contents of:
```
supabase/migrations/20231201000001_rls_policies.sql
```

Click **Run**

### Step 4: Run Migration 3 (Functions)

Copy and paste the entire contents of:
```
supabase/migrations/20231201000002_functions.sql
```

Click **Run**

### Step 5: Verify Tables Created

In the SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- carts
- downloads
- order_items
- orders
- products
- profiles
- reviews

### Step 6: (Optional) Add Sample Product

Run this SQL:
```sql
INSERT INTO products (
    vendor_id,
    name,
    slug,
    description,
    price_cents,
    original_price_cents,
    category,
    status,
    images,
    is_featured,
    rating_avg,
    rating_count
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'AI Automation Starter Pack',
    'ai-automation-starter-pack',
    '10 production-ready n8n workflow templates, RAG system blueprints, and 50+ battle-tested Claude prompts. Everything you need to build AI-powered automation in days, not months.',
    4900,
    9900,
    'Automation',
    'active',
    ARRAY['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
    true,
    4.8,
    24
);
```

---

## ✅ After Database Setup

### Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Set Up Stripe Webhooks

**Terminal 2:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Copy the webhook signing secret** that starts with `whsec_` and add it to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Test Checkout Flow

1. Browse products at http://localhost:3000
2. Add to cart
3. Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. ZIP: Any 5 digits

---

## 📁 Migration File Locations

Your SQL migration files are located at:

1. **Initial Schema** (189 lines)
   ```
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000000_initial_schema.sql
   ```

2. **Security Policies** (107 lines)
   ```
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000001_rls_policies.sql
   ```

3. **Database Functions** (52 lines)
   ```
   /home/romex/projects/warrior-marketplace/supabase/migrations/20231201000002_functions.sql
   ```

---

## 🐛 Troubleshooting

### "Access token not provided"
**Solution**: Run `supabase login` first to authenticate

### "Project not found"
**Solution**: Verify project ref is correct: `dhlhnhacvwylrdxdlnqs`

### "Permission denied"
**Solution**: Make sure you're logged into the correct Supabase account

### "Migration failed"
**Solution**:
1. Check Supabase dashboard for error details
2. Verify SQL syntax in migration files
3. Try running migrations manually via SQL Editor

---

## 🚀 Quick Command Reference

```bash
# Add Supabase CLI to PATH
export PATH="$HOME/.local/bin:$PATH"

# Login
supabase login

# Link project
supabase link --project-ref dhlhnhacvwylrdxdlnqs

# Run all migrations
supabase db push --file supabase/migrations/20231201000000_initial_schema.sql
supabase db push --file supabase/migrations/20231201000001_rls_policies.sql
supabase db push --file supabase/migrations/20231201000002_functions.sql

# Start dev server
npm run dev

# Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

**Time to completion:** 5-10 minutes
**Ready to launch:** ✅ After database setup + Stripe webhook secret added
