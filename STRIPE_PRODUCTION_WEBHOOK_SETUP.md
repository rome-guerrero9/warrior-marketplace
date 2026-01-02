# 🔐 Stripe Production Webhook Setup Guide

**Agent Alpha-5 Mission: Configure Stripe Production Webhook**

## ✅ Production Deployment Status
- **Production URL**: https://warrior-marketplace.vercel.app
- **Webhook Endpoint**: https://warrior-marketplace.vercel.app/api/webhooks/stripe
- **Current Mode**: TEST mode (using test keys)
- **Required**: Switch to PRODUCTION mode + configure webhook

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Production Webhook in Stripe Dashboard

1. **Navigate to Stripe Dashboard**:
   - Login to: https://dashboard.stripe.com
   - **IMPORTANT**: Toggle to **LIVE MODE** (top right - switch from Test to Live)

2. **Go to Webhooks**:
   - Click "Developers" in the left sidebar
   - Click "Webhooks"
   - Click "**+ Add endpoint**" button

3. **Configure Endpoint**:
   - **Endpoint URL**: `https://warrior-marketplace.vercel.app/api/webhooks/stripe`
   - **Description**: `Warrior Marketplace - Production Orders`
   - Click "**Select events**"

4. **Select Events** (Required for order processing):
   - ✅ `checkout.session.completed` - Payment successful, create order
   - ✅ `payment_intent.payment_failed` - Payment failed, mark order as failed
   - ✅ `charge.refunded` - Refund processed, update order status
   - Click "**Add events**"

5. **Finish Setup**:
   - Click "**Add endpoint**"
   - Webhook created! ✅

6. **Copy Webhook Signing Secret**:
   - On the webhook details page, find "**Signing secret**"
   - Click "**Reveal**" or "**Click to reveal**"
   - Copy the secret (starts with `whsec_...`)
   - **Save this** - you'll need it in Step 2

---

### Step 2: Update Vercel Environment Variables

1. **Navigate to Vercel Dashboard**:
   - Login to: https://vercel.com/romes-projects-3e019cc9/warrior-marketplace
   - Click "**Settings**" tab
   - Click "**Environment Variables**"

2. **Switch to Production Stripe Keys**:

   **UPDATE** the following variables (change from Test to Live):

   - **Variable**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - **Current Value** (Test): `pk_test_[REDACTED]`
     - **New Value** (Live): Get from https://dashboard.stripe.com/apikeys (Publishable key)
     - Environment: **Production**

   - **Variable**: `STRIPE_SECRET_KEY`
     - **Current Value** (Test): `sk_test_[REDACTED]`
     - **New Value** (Live): Get from https://dashboard.stripe.com/apikeys (Secret key - click "Reveal live key")
     - Environment: **Production**

   - **Variable**: `STRIPE_WEBHOOK_SECRET`
     - **Current Value** (Test): `whsec_[REDACTED]`
     - **New Value** (Live): The webhook signing secret you copied in Step 1
     - Environment: **Production**

3. **Save Changes**:
   - Click "**Save**" on each variable
   - Vercel will automatically redeploy with new environment variables ✅

---

### Step 3: Verify Webhook Integration (Test in Production)

1. **Wait for Redeployment**:
   - Check Vercel deployment status: https://vercel.com/romes-projects-3e019cc9/warrior-marketplace
   - Wait for "Ready" status (usually 30-60 seconds)

2. **Test Live Payment**:
   - Visit: https://warrior-marketplace.vercel.app
   - Select a product (e.g., MCP Pro Pack - $9/month)
   - Click "Buy Now"
   - **Use REAL credit card** (you'll be charged)
   - Complete checkout

3. **Verify Order Created**:
   - Check Stripe Dashboard → Payments (should see new payment)
   - Check Supabase → Orders table (should have new order with status "paid")
   - You should receive confirmation email (if configured)

4. **Verify Webhook Fired**:
   - In Stripe Dashboard → Webhooks
   - Click on your webhook endpoint
   - Click "**Events**" tab
   - You should see `checkout.session.completed` event with ✅ status

---

## 🔧 Advanced: Webhook Testing Script

If you want to test without making a real payment, use this script:

```bash
# Test webhook endpoint (from project directory)
cd /home/romex/projects/warrior-marketplace
npm run test:webhook:production
```

This will:
- Verify webhook endpoint is accessible (200 status)
- Check webhook signature validation
- Simulate Stripe events (without real charges)

---

## 📊 Success Criteria

After completing Steps 1-3, verify:

- ✅ **Webhook Created**: Visible in Stripe Dashboard (Live mode)
- ✅ **Events Subscribed**: checkout.session.completed, payment_intent.payment_failed, charge.refunded
- ✅ **Vercel Environment**: Production Stripe keys configured
- ✅ **Webhook Secret**: Updated in Vercel
- ✅ **Redeployment**: Complete with new environment variables
- ✅ **Test Payment**: Successfully processed and order created
- ✅ **Webhook Fired**: Event visible in Stripe Dashboard with ✅ status

---

## 🚨 Troubleshooting

### Webhook Not Firing

**Issue**: Payment completes but webhook doesn't fire

**Fixes**:
1. Verify webhook URL is exactly: `https://warrior-marketplace.vercel.app/api/webhooks/stripe`
2. Check Stripe Dashboard → Webhooks → Events tab for error messages
3. Ensure webhook is in **Live mode** (not Test mode)
4. Verify endpoint status is "Active" (not Disabled)

### Webhook Signature Verification Failed

**Issue**: Webhook fires but returns 400 error

**Fixes**:
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe Dashboard secret
2. Ensure secret starts with `whsec_` (not `we_` or other prefix)
3. Check Vercel logs for exact error: `npx vercel logs --follow`

### Order Not Created in Database

**Issue**: Webhook fires successfully but order not in Supabase

**Fixes**:
1. Check Vercel logs for database errors
2. Verify Supabase Service Role Key is correct in Vercel
3. Test RLS policies (should allow service_role to insert)
4. Check `api/webhooks/stripe/route.ts` for error handling

### Payment Successful but Status Shows "pending"

**Issue**: Order created but status not updated to "paid"

**Fixes**:
1. Verify `checkout.session.completed` event is subscribed in Stripe
2. Check webhook event payload includes `payment_status: "paid"`
3. Verify database update logic in webhook handler

---

## 🎯 Euphoria Reward Tracking

**Agent Alpha-5 Performance**:
- **Task**: Configure Stripe production webhook
- **Complexity**: Medium (requires manual steps)
- **Dependencies**: Alpha-4 complete (production deployment)
- **Estimated Time**: 5-10 minutes
- **Reward**: +60 Euphoria Points for successful webhook integration

**Quality Criteria**:
- All 3 events subscribed correctly
- Webhook secret properly configured
- Test payment successfully processed
- Zero webhook errors in Stripe logs

---

## 📝 Notes

- **Test Mode vs Live Mode**: Stripe has separate API keys for test and live environments. Webhooks created in Test mode won't work with Live payments.
- **Webhook Secret Rotation**: If you suspect the webhook secret is compromised, delete the old webhook and create a new one. Update Vercel environment variables immediately.
- **Event Versioning**: Stripe occasionally updates event formats. Monitor webhook changelog: https://stripe.com/docs/upgrades
- **Idempotency**: The webhook handler should be idempotent (safe to receive same event multiple times). Current implementation uses Stripe event ID to prevent duplicate processing.

---

**Created by Agent Alpha-5** | Warrior AI Automations
**Mission Status**: Awaiting Rome's manual webhook creation in Stripe Dashboard
