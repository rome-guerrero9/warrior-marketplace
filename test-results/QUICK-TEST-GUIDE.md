# 🚀 QUICK TEST GUIDE - COPY & PASTE EVERYTHING

**Time**: 20 minutes | **Browser**: Use incognito/private window

---

## 📋 TEST 1: FREE PRODUCT (2 minutes)

### Steps:
1. Go to: https://warrior-marketplace.vercel.app
2. Click: **MCP Starter Pack** (the FREE one)
3. Should auto-redirect to download (no checkout page)

### ✅ Success Criteria:
- [ ] No checkout page shown (or very simplified)
- [ ] Download link accessible
- [ ] No Stripe checkout

---

## 💳 TEST 2: PAID SUBSCRIPTION - SUCCESS (5 minutes)

### Steps:
1. Go to: https://warrior-marketplace.vercel.app
2. Click: **MCP Pro Pack** ($9/month)

### Email to Copy-Paste:
```
test-success@warrioraiautomations.com
```

### Card Details to Copy-Paste:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### ✅ Success Criteria:
- [ ] Checkout page loads
- [ ] Stripe checkout opens
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] URL contains `/order/success?session_id=`

---

## ❌ TEST 3: PAYMENT DECLINE (3 minutes)

### Steps:
1. Go to: https://warrior-marketplace.vercel.app
2. Click: **AgentFlow Pro - Starter** ($29/month)

### Email to Copy-Paste:
```
test-decline@warrioraiautomations.com
```

### DECLINED Card Details to Copy-Paste:
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### ✅ Success Criteria:
- [ ] Stripe shows "Card declined" error
- [ ] Does NOT redirect to success page
- [ ] Can retry with different card
- [ ] No confirmation email

---

## 💰 TEST 4: HIGH-VALUE SUBSCRIPTION (5 minutes)

### Steps:
1. Go to: https://warrior-marketplace.vercel.app
2. Click: **AgentFlow Pro - Agency** ($199/month)

### Email to Copy-Paste:
```
test-agency@warrioraiautomations.com
```

### Card Details to Copy-Paste:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### ✅ Success Criteria:
- [ ] Shows $199.00 correctly
- [ ] Payment succeeds
- [ ] Success page displays

---

## 🔍 AFTER TESTING - VERIFICATION COMMANDS

### Command 1: Verify Database Orders
Copy-paste this command:
```bash
python3 scripts/verify_test_orders.py
```

**Expected output**:
- 2-3 orders with status "paid"
- 0-1 orders with status "failed" (from declined card test)

---

### Command 2: Check Stripe Dashboard
Open these URLs:

**Payments**:
```
https://dashboard.stripe.com/test/payments
```
Look for: 2-3 successful payments

**Subscriptions**:
```
https://dashboard.stripe.com/test/subscriptions
```
Look for: 2-3 active subscriptions

**Webhooks**:
```
https://dashboard.stripe.com/test/webhooks
```
Click your webhook, look for: `checkout.session.completed` events

---

### Command 3: Check Google Analytics
Open:
```
https://analytics.google.com/
```
Navigate to: **Reports → Realtime**

Look for:
- [ ] Active users in last 30 minutes
- [ ] `begin_checkout` events (should see 3-4)
- [ ] `purchase_complete` events (should see 2-3)

---

## 📝 QUICK RESULTS TEMPLATE

Copy-paste this and fill in:

```
PAYMENT TESTING RESULTS - 2025-12-31

✅ TEST 1: FREE DOWNLOAD
Status: PASS / FAIL
Notes: ___________________________

✅ TEST 2: PAID SUCCESS ($9/month)
Status: PASS / FAIL
Order visible in Stripe: YES / NO
Success page shown: YES / NO

❌ TEST 3: PAYMENT DECLINE
Status: PASS / FAIL
Error message shown: YES / NO

💰 TEST 4: HIGH-VALUE ($199/month)
Status: PASS / FAIL
Order visible in Stripe: YES / NO

📊 DATABASE VERIFICATION:
Ran verify_test_orders.py: YES / NO
Total orders found: ___
Orders with "paid" status: ___

🎯 STRIPE DASHBOARD:
Payments visible: YES / NO
Subscriptions active: YES / NO
Webhooks delivered: YES / NO

📈 GOOGLE ANALYTICS:
Events tracking: YES / NO
Realtime data visible: YES / NO

OVERALL: ALL TESTS PASSED ✅ / SOME FAILED ❌
```

---

## 🆘 IF SOMETHING FAILS

**Payment won't process**:
- Check Stripe webhook is configured: https://dashboard.stripe.com/test/webhooks
- Webhook URL should be: `https://warrior-marketplace.vercel.app/api/webhooks/stripe`

**No redirect to success page**:
- Check browser console for errors (F12 → Console tab)
- Wait 10 seconds (webhook might be slow)

**Order not in database**:
- Wait 30 seconds and re-run `verify_test_orders.py`
- Check Stripe webhook delivery logs

**Can't find product**:
- Verify you're on https://warrior-marketplace.vercel.app (not localhost)
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)

---

## ⚡ SUPER QUICK VERSION (If you're in a rush)

Just test these 2:

1. **FREE**: Go to site → Click "MCP Starter Pack" → Should redirect
2. **PAID**: Go to site → Click "MCP Pro Pack" → Email: `test-success@warrioraiautomations.com` → Card: `4242 4242 4242 4242` Exp: `12/25` CVC: `123` ZIP: `12345` → Should show success page

Then run: `python3 scripts/verify_test_orders.py`

If both pass + database shows orders = **READY TO LAUNCH** 🚀

---

**All set! Start testing whenever you're ready.** ✅
