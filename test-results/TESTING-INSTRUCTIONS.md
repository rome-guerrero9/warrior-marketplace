# 🧪 MANUAL TESTING INSTRUCTIONS FOR ROME

**What**: End-to-end payment testing for Warrior AI Marketplace
**When**: Execute now before marketing push
**Time Required**: 20-30 minutes
**Why**: Final validation that entire revenue flow works correctly

---

## 🚀 QUICK START

### **Pre-Test Checklist** ✅
- [ ] Production site is live: https://warrior-marketplace.vercel.app
- [ ] Stripe test mode is active (use test cards)
- [ ] Incognito/private browser window ready (prevents cached data)
- [ ] Have Stripe test cards ready (below)
- [ ] GA4 Realtime open in another tab: https://analytics.google.com/

---

## 📝 TEST EXECUTION

### **Test 1: Free Product Download** (2 minutes)

**URL**: https://warrior-marketplace.vercel.app

1. Click on **"MCP Starter Pack"** card (the FREE one)
2. **Expected**: Auto-redirect to download URL (should not see checkout page)
3. **Verify**:
   - Did you auto-redirect without seeing a checkout page? ✅ / ❌
   - Can you access the download link? ✅ / ❌

**Notes**: ____________________________________

---

### **Test 2: Successful Paid Subscription** (5 minutes)

**URL**: https://warrior-marketplace.vercel.app

1. Click on **"MCP Pro Pack"** card ($9/month)
2. **Checkout page should load** - verify product details are correct
3. Enter email: `test-success@warrioraiautomations.com`
4. Click **"Continue to Payment"**
5. **Stripe checkout should open** (new page or modal)
6. Enter test card details:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/25` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
7. Click **"Subscribe"**
8. **Wait for redirect** (should go to success page)

**Verification Checklist**:
- [ ] Checkout page displayed product correctly
- [ ] Email field accepted input
- [ ] Stripe checkout opened
- [ ] Payment processed successfully
- [ ] Redirected to `/order/success?session_id=cs_XXX`
- [ ] Success page displays "Payment Successful! 🎉"
- [ ] Check your email for receipt (if email is configured)

**Browser Console**: Any errors? ____________________________________

**GA4 Realtime** (https://analytics.google.com/):
- [ ] See active user in last 30 minutes?
- [ ] See `begin_checkout` event?
- [ ] See `purchase_complete` event?

---

### **Test 3: Payment Decline Flow** (3 minutes)

**URL**: https://warrior-marketplace.vercel.app

1. Click on **"AgentFlow Pro - Starter"** card ($29/month)
2. Enter email: `test-decline@warrioraiautomations.com`
3. Click **"Continue to Payment"**
4. Enter **DECLINED** test card:
   - **Card**: `4000 0000 0000 0002` (this card always declines)
   - **Expiry**: `12/25`
   - **CVC**: `123`
   - **ZIP**: `12345`
5. Click **"Subscribe"**
6. **Expected**: Error message from Stripe (card declined)

**Verification Checklist**:
- [ ] Stripe showed "Your card was declined" error
- [ ] Did NOT redirect to success page
- [ ] Can retry with different card
- [ ] No confirmation email sent

**Notes**: ____________________________________

---

### **Test 4: High-Value Subscription** (5 minutes)

**URL**: https://warrior-marketplace.vercel.app

1. Click on **"AgentFlow Pro - Agency"** card ($199/month)
2. Enter email: `test-agency@warrioraiautomations.com`
3. Click **"Continue to Payment"**
4. Enter test card: `4242 4242 4242 4242`
5. Complete payment
6. **Verify**: Success page shows, order created

**Verification Checklist**:
- [ ] Checkout displayed $199.00 correctly
- [ ] Payment successful
- [ ] Success page displayed
- [ ] Correct product name on success page

---

## 🔍 POST-TEST VERIFICATION

### **Step 1: Check Database Orders**

Run this command to verify orders were created:

```bash
python3 scripts/verify_test_orders.py
```

**Expected Output**:
- Orders for `test-success@warrioraiautomations.com` with status "paid"
- Orders for `test-agency@warrioraiautomations.com` with status "paid"
- Possibly orders for `test-decline@warrioraiautomations.com` with status "failed" (or none)

### **Step 2: Check Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/payments
2. **Verify**: See test payments for test-success@ and test-agency@ emails
3. Click into each payment to see details
4. Check status is "Succeeded"

Go to: https://dashboard.stripe.com/test/subscriptions
5. **Verify**: See 2 active subscriptions (MCP Pro Pack, AgentFlow Agency)

Go to: https://dashboard.stripe.com/test/webhooks
6. Click on your webhook endpoint
7. **Verify**: See `checkout.session.completed` events for successful payments
8. Check that delivery status is "Succeeded"

### **Step 3: Check Google Analytics**

1. Go to: https://analytics.google.com/
2. Navigate to: **Reports → Realtime**
3. **Verify**: See events from last 30 minutes:
   - `begin_checkout` events: Should see 3-4 (all checkouts you initiated)
   - `purchase_complete` events: Should see 2 (successful payments only)
   - `view_item` events: Should see 4+ (each product you viewed)

4. Navigate to: **Reports → Engagement → Events**
5. **Verify**: Events are being tracked (may take 24 hours to populate)

---

## 📊 TEST RESULTS TEMPLATE

Copy this and fill in results:

```
PAYMENT TESTING RESULTS
Date: 2025-12-31
Tester: Rome Guerrero

TEST 1: FREE DOWNLOAD
Status: PASS / FAIL
Notes: ________________________________

TEST 2: PAID SUBSCRIPTION (Success)
Status: PASS / FAIL
Order Number: ________________________________
Stripe Payment Intent: ________________________________
Notes: ________________________________

TEST 3: PAYMENT DECLINE
Status: PASS / FAIL
Error Message Shown: ________________________________
Notes: ________________________________

TEST 4: HIGH-VALUE SUBSCRIPTION
Status: PASS / FAIL
Order Number: ________________________________
Notes: ________________________________

DATABASE VERIFICATION
Total orders created: ________________________________
Orders with status "paid": ________________________________
Orders with status "failed": ________________________________

STRIPE VERIFICATION
Payments visible in dashboard: YES / NO
Subscriptions created: ________________________________ (count)
Webhook delivery successful: YES / NO

ANALYTICS VERIFICATION
Events tracking: YES / NO
Conversion funnel complete: YES / NO

ISSUES FOUND:
1. ________________________________
2. ________________________________
3. ________________________________

OVERALL STATUS: PASS / FAIL
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

**Issue**: Stripe checkout doesn't open
**Solution**: Check browser console for errors, verify Stripe publishable key is set

**Issue**: Payment succeeds but no redirect
**Solution**: Check webhook is configured correctly, verify webhook secret matches

**Issue**: Order not found in database
**Solution**: Wait 10 seconds (webhook may be delayed), check Stripe webhook delivery logs

**Issue**: Analytics events not showing
**Solution**: Wait 60 seconds, ensure GA_MEASUREMENT_ID is set, check browser console

---

## ✅ SUCCESS CRITERIA

**ALL tests must pass for launch readiness:**
- ✅ Free product downloads work
- ✅ Paid subscriptions process successfully
- ✅ Payment declines are handled gracefully
- ✅ All orders appear in database with correct status
- ✅ Stripe webhooks deliver successfully
- ✅ Analytics events are tracking
- ✅ No console errors during any flow
- ✅ Success pages display correctly

---

## 🚀 AFTER TESTING

Once all tests pass:

1. **Clean up test data** (optional):
   ```sql
   DELETE FROM orders WHERE customer_email LIKE 'test-%@warrioraiautomations.com';
   ```

2. **Cancel test subscriptions** in Stripe dashboard (optional):
   - Go to: https://dashboard.stripe.com/test/subscriptions
   - Cancel each test subscription to keep dashboard clean

3. **Mark Bravo-1 task as complete** ✅

4. **Proceed to next high-value task**:
   - Bravo-5: Final code quality review
   - Charlie-3: Email automation setup
   - Charlie-4: Product documentation enhancement

---

**Ready to test!** 🚀

**Estimated time**: 20-30 minutes for all scenarios + verification

**If you encounter any issues, take screenshots and note the error messages.**
