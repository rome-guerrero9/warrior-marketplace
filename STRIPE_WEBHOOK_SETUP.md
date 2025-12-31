# Stripe Webhook Configuration Guide

## Production Webhook Setup

✅ **Deployment Status**: Webhook endpoint deployed to production at:
- **URL**: `https://warrior-marketplace.vercel.app/api/webhooks/stripe`
- **Deployment**: Latest (with enhanced logging)
- **Date**: 2025-12-29

---

## Step-by-Step Configuration

### 1. Access Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Switch to **Test Mode** (toggle in top-right)
3. Navigate to **Developers** → **Webhooks** (left sidebar)

### 2. Add Webhook Endpoint

Click **"Add endpoint"** button and configure:

**Endpoint URL**:
```
https://warrior-marketplace.vercel.app/api/webhooks/stripe
```

**Events to Send**: Click "Select events" and choose:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`

**API Version**: Use latest (2025-08-27 or newer)

Click **"Add endpoint"** to save.

### 3. Get Webhook Signing Secret

After creating the endpoint:
1. Click on the newly created webhook endpoint
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)

### 4. Add Secret to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select **warrior-marketplace** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update variable:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (paste the secret from step 3)
   - **Environment**: Select **Production** and **Preview**
5. Click **Save**

### 5. Redeploy to Apply Secret

After adding the environment variable:
```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard → **Deployments** → **Redeploy**

---

## Testing the Webhook

### Option 1: Test with Stripe Test Card (Recommended)

1. Go to https://warrior-marketplace.vercel.app
2. Select any product and click "Buy Now"
3. Use Stripe test card:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/30`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
4. Complete the payment
5. Check webhook logs in Stripe Dashboard

### Option 2: Send Test Webhook from Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select `checkout.session.completed`
5. Click **"Send test webhook"**

---

## Verifying Webhook is Working

### Check Stripe Dashboard Logs

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent events**:
   - ✅ Green checkmark = Webhook received successfully (200 response)
   - ❌ Red X = Webhook failed (check error details)

### Check Vercel Logs

```bash
# View recent webhook logs
vercel logs warrior-marketplace --prod | grep "\[Webhook\]"
```

Or in Vercel Dashboard:
1. Select **warrior-marketplace** project
2. Go to **Deployments** → Click latest deployment
3. View **Runtime Logs**
4. Look for `[Webhook]` prefixed messages

### Check Supabase Database

1. Go to Supabase Dashboard → **Table Editor**
2. Select **orders** table
3. Look for recent orders with:
   - `status = 'paid'`
   - `stripe_payment_intent_id` populated
   - `updated_at` matching webhook timestamp

---

## Webhook Log Messages (What to Expect)

**Successful Payment Flow**:
```
[Webhook] checkout.session.completed received
[Webhook] Session metadata: { order_id: '...', order_number: '...' }
[Webhook] Order ID from metadata: <uuid>
[Webhook] Updating order status to paid...
[Webhook] Order update result: [{ id: '...', status: 'paid', ... }]
[Webhook] Fetching order for fulfillment...
[Webhook] Order fetched successfully: { id: '...', status: 'paid', items_count: 1 }
```

**Common Issues**:
- `No order_id in session metadata` → Order was not created via `/api/checkout`
- `Error updating order: ...` → Database permission issue
- `Error fetching order: ...` → Order doesn't exist or RLS policy issue

---

## Troubleshooting

### Webhook Returns 400/500 Error

**Check**:
1. Webhook signing secret is correct in Vercel env vars
2. Endpoint URL is correct (no typos)
3. SSL certificate is valid (Vercel handles this automatically)

**Fix**:
- Update `STRIPE_WEBHOOK_SECRET` in Vercel
- Redeploy: `vercel --prod`

### Order Status Not Updating

**Check**:
1. Webhook is receiving events (check Stripe Dashboard)
2. Metadata contains `order_id` (check webhook logs)
3. Order exists in database with matching ID
4. RLS policies allow service role to UPDATE orders

**Debug**:
```bash
# View webhook processing logs
vercel logs warrior-marketplace --prod | grep "\[Webhook\]" | tail -50
```

### n8n Fulfillment Not Triggered

**Check**:
1. `N8N_WEBHOOK_URL` is set in Vercel env vars
2. n8n workflow is active and accepting requests
3. Webhook logs show n8n request being sent

---

## Production Checklist

Before going live with real payments:

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook signing secret added to Vercel env vars
- [ ] Tested with Stripe test card (4242...)
- [ ] Verified order status updates to 'paid' in database
- [ ] Verified webhook logs show successful processing
- [ ] Tested failed payment scenario (use test card `4000 0000 0000 0002`)
- [ ] Tested refund scenario in Stripe Dashboard
- [ ] n8n order fulfillment workflow tested (if applicable)
- [ ] Stripe account switched to **Live Mode**
- [ ] Webhook endpoint recreated for **Live Mode**
- [ ] Live webhook signing secret updated in Vercel

---

## Security Notes

🔒 **Critical Security Points**:

1. **Never expose webhook signing secret** - It's like a password for your webhook
2. **Always verify signature** - The webhook code uses `stripe.webhooks.constructEvent()` to verify authenticity
3. **Service role key is server-side only** - Never exposed to client, used in webhook for database operations
4. **HTTPS required** - Stripe only sends webhooks to HTTPS endpoints (Vercel provides this)

---

## Next Steps After Configuration

1. ✅ Configure webhook in Stripe Dashboard (follow steps above)
2. ✅ Test with a real payment using test card
3. ✅ Verify order status updates in Supabase
4. ✅ Monitor webhook logs for any errors
5. 🔄 Switch to Live Mode when ready for production
6. 📊 Set up alerts for webhook failures (optional)

---

## Support Resources

- **Stripe Webhook Docs**: https://stripe.com/docs/webhooks
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Vercel Logs**: https://vercel.com/docs/observability/runtime-logs
- **Supabase Logs**: Supabase Dashboard → Logs

---

**Status**: Ready for production webhook configuration
**Last Updated**: 2025-12-29
**Next Action**: Configure webhook in Stripe Dashboard following steps above
