# RLS Migration - Automated CLI Instructions

## Problem
The Supabase security warning is blocking the payment page:
> "The table public.stripe_events is in the public schema but does not have Row-Level Security (RLS) enabled"

## Solution

I've created an automated Node.js script to apply the RLS migration. Here's how to run it:

### Option 1: Automated Script (Recommended for CLI)

**Step 1: Get your Supabase database password**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `dhlhnhacvwylrdxdlnqs`
3. Go to **Project Settings** → **Database**
4. Find **Connection string** section
5. Click **Show** to reveal your database password
6. Copy the password

**Step 2: Run the migration script**
```bash
cd /home/romex/projects/warrior-marketplace

# Run with password as environment variable
DATABASE_PASSWORD="your_password_here" node scripts/apply-rls-migration.js
```

**Alternative: Add to .env.local (more secure)**
```bash
# Add this line to .env.local:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.dhlhnhacvwylrdxdlnqs.supabase.co:5432/postgres"

# Then run:
node scripts/apply-rls-migration.js
```

### Option 2: Manual via Supabase Dashboard (Fastest)

If you prefer not to retrieve the database password:

1. Go to [Supabase Dashboard](https://app.supabase.com) → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of: `supabase/migrations/20260108000000_enable_stripe_events_rls.sql`
4. Click **Run** (or press Cmd+Enter)

## What the Migration Does

The migration applies these security policies:

1. **Enables RLS** on `stripe_events` table
2. **Service role can insert** - Allows your API to record webhook events
3. **Service role can read** - Allows your API to check for duplicates
4. **Admins can read** - Allows admin users to debug webhook history

## Verification

After applying the migration, test the payment page:

1. Visit: https://warrior-marketplace.vercel.app
2. Click any product's "Buy Now" button
3. The checkout page should load without errors
4. Verify no RLS warnings in Supabase Dashboard

## Why Vercel CLI Can't Do This

Vercel CLI manages your **application deployments**, but cannot modify your **Supabase database schema**. Database migrations require direct PostgreSQL access, which is why we need either:
- Supabase Dashboard (GUI)
- PostgreSQL client (psql)
- Node.js script with database connection (automated)

## Troubleshooting

**Error: "password authentication failed"**
- Double-check you copied the correct password from Supabase Dashboard
- Make sure there are no extra spaces in the password

**Error: "policy already exists"**
- This is normal if you've run the script before
- The migration is already applied - test the payment page

**Still seeing RLS warning**
- Refresh the Supabase Dashboard page
- Check that all 4 policies were created: run this in SQL Editor:
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'stripe_events';
  ```

## Files Created

- ✅ `/supabase/migrations/20260108000000_enable_stripe_events_rls.sql` - Migration SQL
- ✅ `/scripts/apply-rls-migration.js` - Automated execution script
- ✅ This instruction file

## Next Steps After Migration

Once RLS is applied:
1. Test the payment flow end-to-end
2. Verify Stripe webhook events are being recorded
3. Continue with remaining deployment tasks
