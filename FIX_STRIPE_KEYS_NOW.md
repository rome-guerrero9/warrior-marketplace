# 🚨 IMMEDIATE ACTION REQUIRED - Fix Stripe Keys

## The Problem (Confirmed)

```
Publishable Key: pk_test_... ← TEST MODE ✅
Secret Key: sk_org_live_...  ← LIVE MODE ❌

ERROR: Keys don't match!
```

---

## The Solution (3 Minutes)

### Option 1: Fix for Development (Recommended) 🧪

**Use TEST mode keys for local development:**

1. **Open Stripe Dashboard in TEST mode**:
   - Go to: https://dashboard.stripe.com/test/apikeys
   - **Make sure the toggle says "Viewing test data"** (top-left corner)

2. **Copy your TEST Secret Key**:
   - Look for "Secret key" section
   - Click **"Reveal test key"** button
   - Copy the key (starts with `sk_test_`)

3. **Update .env.local**:
   ```bash
   cd ~/projects/warrior-marketplace
   nano .env.local
   ```

   Find this line:
   ```bash
   STRIPE_SECRET_KEY=sk_org_live_0dbfjM9YibaRbHS95Oaws8hYfoi0gk5zlbY0cG8f7I3q97u979r8593BL5CK3Oq7dl7OQ3hs6Ko7hp4O63Ck4yG74y59F5y14Xl4CR6P73OV5CJ3yf6tN5gY05F0xg0bT7Ky3iY57e4lJ40IfnXbPf2sYaF38Ldfys5WH4jg2Xm9mXgyM1WUcKj7197ZF3Ii6Se6jw1s3eN19445KJ3IvdkvgUx3rn01
   ```

   Replace with:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```
   (Paste the actual test key you copied)

4. **Save and test**:
   ```bash
   # Save the file (Ctrl+X, Y, Enter)
   node test-env-validation.js
   ```

   Should show:
   ```
   ✅ Stripe keys are properly configured!
      Mode: TEST (Development)
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   ```

---

### Option 2: Switch to LIVE Mode (Production Only) ⚠️

**Only do this if you want to process real payments:**

1. **Get LIVE keys**:
   - Go to: https://dashboard.stripe.com/apikeys
   - Toggle to "Viewing live data"
   - ⚠️ **Warning**: These process real payments!

2. **Copy BOTH keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...` (NOT sk_org_live_)

3. **Update .env.local** with BOTH:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
   ```

---

## Quick Test Script

I've created a validation script for you:

```bash
cd ~/projects/warrior-marketplace
node test-env-validation.js
```

**Expected output after fix**:
```
🔍 Testing Stripe Key Configuration...

Publishable Key: pk_test_51S5xAxCeTGT...
Secret Key: sk_test_51S5xAxCeTGT...

Publishable Key Mode: TEST
Secret Key Mode: TEST

✅ Stripe keys are properly configured!
   Mode: TEST (Development)
```

---

## Why This Happened

You have an **organization-level LIVE key** (`sk_org_live_...`) which is for Stripe Connect platforms. For a simple marketplace, you need:
- Development: `sk_test_...`
- Production: `sk_live_...`

---

## After Fixing

1. ✅ Run validation: `node test-env-validation.js`
2. ✅ Start dev server: `npm run dev`
3. ✅ Test checkout with card: `4242 4242 4242 4242`
4. ✅ Payments should work! 🎉

---

## Files Updated

- ✅ `lib/env.ts` - Now validates key modes automatically
- ✅ `test-env-validation.js` - Quick validation script
- ✅ `STRIPE_KEY_MODE_FIX.md` - Detailed explanation
- ✅ `FIX_STRIPE_KEYS_NOW.md` - This file (action plan)

---

**Time to fix: 3 minutes**
**Difficulty: Easy**
**Result: Working payments** ✨
