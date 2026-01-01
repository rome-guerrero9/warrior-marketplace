# 🧪 END-TO-END PAYMENT TESTING PLAN
**Project**: Warrior AI Marketplace
**Date**: 2025-12-31
**Tester**: Claude Code (Agent Bravo-1)
**Environment**: Production (https://warrior-marketplace.vercel.app)

---

## 📋 TEST OVERVIEW

### Products Under Test (6 Total)

**MCP Servers** (Digital Products):
1. ✅ **MCP Starter Pack** - FREE ($0) - Immediate download
2. ✅ **MCP Pro Pack** - $9/month - Subscription
3. ✅ **MCP Agency Suite** - $29/month - Subscription

**AgentFlow Pro** (SaaS Subscriptions):
4. ✅ **AgentFlow Pro - Starter** - $29/month - Subscription
5. ✅ **AgentFlow Pro - Professional** - $79/month - Subscription
6. ✅ **AgentFlow Pro - Agency** - $199/month - Subscription

---

## 🎯 TEST SCENARIOS

### **Scenario 1: Free Product Download Flow** ✅
**Product**: MCP Starter Pack
**Expected Flow**: Homepage → Product → Auto-redirect to download
**Test Steps**:
1. Navigate to https://warrior-marketplace.vercel.app
2. Click on "MCP Starter Pack"  (Free product)
3. System should auto-redirect to download URL
4. Verify file is accessible

**Success Criteria**:
- ✅ Auto-redirect works (no checkout page for free products)
- ✅ Download URL is accessible
- ✅ File downloads successfully
- ✅ No Stripe checkout session created
- ✅ No order record in database (or free order created)

**Analytics Verification**:
- Check GA4 for `view_item` event (free product)
- Verify no `begin_checkout` or `purchase` events

---

### **Scenario 2: Paid Subscription Flow (Success)** ✅
**Product**: MCP Pro Pack ($9/month)
**Expected Flow**: Homepage → Product → Checkout → Stripe → Webhook → Success
**Test Steps**:
1. Navigate to https://warrior-marketplace.vercel.app
2. Click on "MCP Pro Pack" ($9/month)
3. Enter test email: `test-success@warrioraiautomations.com`
4. Click "Continue to Payment"
5. Complete Stripe checkout with test card: `4242 4242 4242 4242`
6. Expiry: Any future date (e.g., 12/25)
7. CVC: Any 3 digits (e.g., 123)
8. ZIP: Any 5 digits (e.g., 12345)
9. Click "Subscribe"
10. Wait for redirect to success page

**Success Criteria**:
- ✅ Checkout page loads correctly
- ✅ Stripe checkout session created
- ✅ Payment processes successfully
- ✅ Webhook fires and updates order status to "paid"
- ✅ Redirect to `/order/success?session_id=cs_XXX`
- ✅ Success page displays correctly
- ✅ Order record created in database with status "paid"
- ✅ Email sent (if email automation is active)

**Database Verification**:
```sql
SELECT
  id, order_number, customer_email, total_cents, status,
  stripe_payment_intent_id, created_at
FROM orders
WHERE customer_email = 'test-success@warrioraiautomations.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Analytics Verification**:
- Check GA4 for `view_item` event
- Check GA4 for `begin_checkout` event
- Check GA4 for `purchase_complete` event
- Verify full conversion funnel

**Stripe Dashboard Verification**:
- Verify subscription created: https://dashboard.stripe.com/test/subscriptions
- Check webhook delivery: https://dashboard.stripe.com/test/webhooks
- Verify `checkout.session.completed` event delivered

---

### **Scenario 3: Payment Failure Flow (Declined Card)** ✅
**Product**: AgentFlow Pro - Starter ($29/month)
**Expected Flow**: Homepage → Product → Checkout → Stripe → Payment Declined → Error
**Test Steps**:
1. Navigate to https://warrior-marketplace.vercel.app
2. Click on "AgentFlow Pro - Starter" ($29/month)
3. Enter test email: `test-decline@warrioraiautomations.com`
4. Click "Continue to Payment"
5. Complete Stripe checkout with declined test card: `4000 0000 0000 0002`
6. Expiry: Any future date
7. CVC: Any 3 digits
8. ZIP: Any 5 digits
9. Click "Subscribe"
10. Observe error handling

**Success Criteria**:
- ✅ Checkout page loads correctly
- ✅ Stripe checkout session created
- ✅ Payment is declined by Stripe
- ✅ Error message displayed to user (Stripe handles this)
- ✅ User remains on Stripe checkout (can retry with different card)
- ✅ No order created in database (or order created with "failed" status)
- ✅ Webhook fires with `payment_intent.payment_failed` event (if applicable)
- ✅ No success page redirect
- ✅ No confirmation email sent

**Database Verification**:
```sql
SELECT
  id, order_number, customer_email, status
FROM orders
WHERE customer_email = 'test-decline@warrioraiautomations.com'
ORDER BY created_at DESC
LIMIT 1;
```
Expected: No record OR record with status = "failed"

**Analytics Verification**:
- Check GA4 for `begin_checkout` event
- Verify NO `purchase_complete` event

---

### **Scenario 4: High-Value Subscription Flow** ✅
**Product**: AgentFlow Pro - Agency ($199/month)
**Expected Flow**: Same as Scenario 2, but with higher-value product
**Test Steps**:
1. Navigate to https://warrior-marketplace.vercel.app
2. Click on "AgentFlow Pro - Agency" ($199/month)
3. Enter test email: `test-agency@warrioraiautomations.com`
4. Click "Continue to Payment"
5. Complete Stripe checkout with test card: `4242 4242 4242 4242`
6. Complete payment
7. Verify success flow

**Success Criteria**:
- Same as Scenario 2, but with:
  - ✅ Total amount: $199.00
  - ✅ Subscription tier: Agency
  - ✅ Higher value reflected in analytics

**Purpose**: Ensures pricing calculation is correct for all tiers

---

## 🔍 ADDITIONAL TEST CASES

### **Edge Case 1: Network Interruption During Checkout**
**Test Steps**:
1. Start checkout process
2. Disconnect network after clicking "Subscribe" but before webhook fires
3. Reconnect and observe recovery

**Expected**: Webhook should eventually fire (Stripe retries), order status updates correctly

---

### **Edge Case 2: Duplicate Email Submissions**
**Test Steps**:
1. Complete checkout with email: `test-duplicate@warrioraiautomations.com`
2. Immediately start another checkout with same email
3. Verify both subscriptions are created (or second is prevented)

**Expected**: Both subscriptions should be allowed (different Stripe subscription IDs)

---

### **Edge Case 3: Expired Card**
**Test Card**: `4000 0000 0000 0069` (Expired card)
**Expected**: Payment declined, user can retry

---

### **Edge Case 4: Insufficient Funds**
**Test Card**: `4000 0000 0000 9995` (Insufficient funds)
**Expected**: Payment declined, user can retry

---

## 🛠️ TESTING TOOLS & RESOURCES

**Stripe Test Cards**: https://stripe.com/docs/testing#cards

**Success Cards**:
- `4242 4242 4242 4242` - Visa (always succeeds)
- `5555 5555 5555 4444` - Mastercard (always succeeds)
- `3782 822463 10005` - American Express (always succeeds)

**Decline Cards**:
- `4000 0000 0000 0002` - Generic decline
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0000 0000 0069` - Expired card
- `4000 0000 0000 0127` - Incorrect CVC

**3D Secure Cards** (requires authentication):
- `4000 0027 6000 3184` - 3D Secure required

**Stripe Dashboard**:
- Test payments: https://dashboard.stripe.com/test/payments
- Test subscriptions: https://dashboard.stripe.com/test/subscriptions
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Supabase Dashboard**:
- Orders table: https://supabase.com/dashboard/project/nzhtavvgjuvznpalqaox/editor/orders
- Order items: https://supabase.com/dashboard/project/nzhtavvgjuvznpalqaox/editor/order_items

**Google Analytics 4**:
- Realtime: https://analytics.google.com/ → Reports → Realtime
- DebugView: https://analytics.google.com/ → Admin → DebugView
- Events: https://analytics.google.com/ → Reports → Engagement → Events

---

## 📊 TEST EXECUTION TRACKING

### Scenario Results

| # | Scenario | Product | Status | Notes |
|---|----------|---------|--------|-------|
| 1 | Free Download | MCP Starter Pack | ⏳ Pending | Manual browser test required |
| 2 | Paid Subscription | MCP Pro Pack | ⏳ Pending | Manual browser test required |
| 3 | Payment Failure | AgentFlow Starter | ⏳ Pending | Manual browser test required |
| 4 | High-Value | AgentFlow Agency | ⏳ Pending | Manual browser test required |

### Defects Found

| ID | Scenario | Severity | Description | Status |
|----|----------|----------|-------------|--------|
| - | - | - | - | - |

---

## ✅ ACCEPTANCE CRITERIA

**All scenarios must pass with:**
- ✅ No console errors in browser
- ✅ Correct order status in database
- ✅ Webhook delivery confirmed in Stripe
- ✅ Analytics events firing correctly
- ✅ Success page displays for successful payments
- ✅ Error handling works for failed payments
- ✅ No data leaks or security issues

**Performance Requirements:**
- Checkout page loads < 2 seconds
- Webhook processes < 5 seconds
- Success page loads < 1 second

**Analytics Requirements:**
- All events visible in GA4 Realtime within 60 seconds
- Conversion funnel shows complete path
- No missing events in DebugView

---

## 📝 TEST EXECUTION LOG

**Rome Guerrero will execute these manual tests in browser.**

Each test should include:
1. Screenshots of key steps
2. Browser console logs (if errors occur)
3. Database query results showing order records
4. Stripe dashboard confirmation
5. GA4 event confirmation

---

**Ready for Manual Execution** ✅
