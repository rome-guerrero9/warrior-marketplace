# 🔧 Stripe Key Mode Mismatch - SOLUTION

## Problem Identified

Your `.env.local` has **mismatched Stripe keys**:

```bash
# ❌ WRONG - TEST publishable with LIVE secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S5xAxCe...  # TEST MODE
STRIPE_SECRET_KEY=sk_org_live_0dbfjM9YibaRbHS...         # LIVE MODE
```

**Result**: Stripe API rejects requests because the keys don't match modes.

---

## Solution

You **MUST** use matching key pairs. Choose one:

### Option 1: TEST MODE (Recommended for Development)

Use TEST keys for local development and testing:

```bash
# Get your keys from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S5xAxCe...  # Keep this
STRIPE_SECRET_KEY=sk_test_51S5xAxCe...                    # ← Need TEST secret key

# Webhook secret from: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...                           # From CLI output
```

### Option 2: LIVE MODE (Production Only)

Use LIVE keys for production deployment:

```bash
# Get your keys from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51S5xAxCe...  # ← Need LIVE publishable
STRIPE_SECRET_KEY=sk_live_51S5xAxCe...                    # ← Need LIVE secret (NOT sk_org_live_)

# Webhook secret from: Stripe Dashboard → Webhooks → Add endpoint
STRIPE_WEBHOOK_SECRET=whsec_...                           # From dashboard
```

---

## How to Get Correct Keys

### For TEST Mode (Development)

1. **Go to Stripe Dashboard**:
   - Visit: https://dashboard.stripe.com/test/apikeys
   - Toggle switch should say **"Viewing test data"**

2. **Copy Keys**:
   ```bash
   Publishable key: pk_test_... (you already have this)
   Secret key: sk_test_...      (click "Reveal test key token")
   ```

3. **Get Webhook Secret**:
   ```bash
   # Terminal:
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Copy the whsec_... secret from output
   ```

### For LIVE Mode (Production)

1. **Go to Stripe Dashboard**:
   - Visit: https://dashboard.stripe.com/apikeys
   - Toggle switch should say **"Viewing live data"**
   - ⚠️ **Warning**: Live keys process real payments!

2. **Copy Keys**:
   ```bash
   Publishable key: pk_live_...
   Secret key: sk_live_...      (click "Reveal live key token")
   ```

3. **Create Production Webhook**:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the signing secret (whsec_...)

---

## About sk_org_live_ Keys

The key you have (`sk_org_live_...`) is a **Stripe Connect organization key**. This is used for:
- Stripe Connect platforms
- Managing multiple connected accounts
- Platform fee collection

**For a simple marketplace**, you should use standard keys:
- `sk_test_...` for testing
- `sk_live_...` for production

---

## Updated .env.local (TEST MODE)

Replace your current Stripe section with:

```bash
# ============================================
# STRIPE CONFIGURATION - TEST MODE 🧪
# ============================================
# Safe for development - Uses test credit cards
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S5xAxCeTGTUCXhs47Iy0IirENA5iUxI7XdEUSBRb2teqXkBFBvvnPF5y53KEK1uEB22X0MCNEVs2vs0LDWbtzfR00nca0EZwE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Action Required**:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Replace `sk_test_YOUR_SECRET_KEY_HERE` in `.env.local`
4. Run `stripe listen` to get webhook secret
5. Replace `whsec_YOUR_WEBHOOK_SECRET_HERE` in `.env.local`
6. Restart your dev server: `npm run dev`

---

## Testing After Fix

### 1. Verify Keys Load
```bash
cd ~/projects/warrior-marketplace
npm run dev
```

You should see the error message now that I added to `lib/env.ts`:
```
Error: Stripe key mode mismatch: You're using a TEST publishable key (pk_test_...)
with a LIVE secret key (sk_org_live_0d...). Both keys must be either TEST or LIVE mode.
```

### 2. Fix and Retest
After updating `.env.local` with matching TEST keys:
```bash
npm run dev
# Should start without errors
```

### 3. Test Checkout Flow
```bash
# Terminal 1: Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Dev server
npm run dev

# Browser:
# 1. Go to http://localhost:3000
# 2. Click "Buy Now" on any product
# 3. Use test card: 4242 4242 4242 4242
# 4. Any future date, any CVC
# 5. Should redirect to Stripe checkout ✅
```

---

## Validation Added

I've updated `lib/env.ts` to automatically detect key mode mismatches:

```typescript
// Now validates that both keys are in same mode
if (isPublishableTest && !isSecretTest) {
  throw new Error(
    `Stripe key mode mismatch: You're using a TEST publishable key ` +
    `with a LIVE secret key. Both keys must be either TEST or LIVE mode.`
  )
}
```

This will catch the error immediately when the app starts! 🎯

---

## Quick Reference

| Environment | Publishable Key | Secret Key | Use Case |
|-------------|----------------|------------|----------|
| **Test** | `pk_test_...` | `sk_test_...` | Development, testing |
| **Live** | `pk_live_...` | `sk_live_...` | Production, real payments |

**Never mix test and live keys!**

---

## Next Steps

1. ✅ Choose TEST or LIVE mode (use TEST for development)
2. ✅ Get matching keys from Stripe Dashboard
3. ✅ Update `.env.local` with correct keys
4. ✅ Restart dev server
5. ✅ Test checkout flow with test card
6. ✅ Celebrate working payments! 🎉

---

**Created**: 2026-01-04
**Issue**: Stripe key mode mismatch (pk_test_ + sk_org_live_)
**Fix**: Use matching TEST or LIVE key pairs
**Validation Added**: `lib/env.ts` now detects mismatches automatically
