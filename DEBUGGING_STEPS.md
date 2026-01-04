# 🔍 Debugging "Missing Environment Variables" Error

## Current Status
- ✅ Stripe keys are properly configured (TEST mode)
- ✅ Dev server starts successfully
- ❌ Error appears when clicking checkout in browser

---

## Step 1: Check Browser Console

1. **Open your website**: http://localhost:3000
2. **Press F12** to open Developer Tools
3. **Click the "Console" tab**
4. **Click any checkout/buy button**
5. **Look for red error messages**

**Expected**: You should see an error message mentioning which environment variable is missing.

---

## Step 2: Check Network Tab

1. **In Developer Tools, click "Network" tab**
2. **Click a checkout button**
3. **Look for the `/api/checkout` request**
4. **Click on it and check the "Response" tab**

**Expected**: You'll see the actual error response from the API.

---

## Step 3: Test API Directly

In a new terminal:

```bash
# Test the checkout API endpoint
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "test", "quantity": 1}],
    "customerEmail": "test@example.com"
  }'
```

**Expected**: This will show the actual API error message.

---

## Step 4: Verify Environment Variables

```bash
cd ~/projects/warrior-marketplace
node test-env-validation.js
```

**Expected**: Should show "✅ Stripe keys are properly configured!"

---

## Common Issues & Solutions

### Issue 1: Missing NEXT_PUBLIC_APP_URL
**Symptoms**: Error mentions `NEXT_PUBLIC_APP_URL`
**Solution**: Already set in `.env.local` ✅

### Issue 2: Supabase Connection Failed
**Symptoms**: Error says "Failed to fetch products"
**Solution**: Check Supabase connection:
```bash
# Test Supabase connection
node test-db.js
```

### Issue 3: Browser Cached Old Code
**Symptoms**: Error persists even after fixing
**Solution**:
1. Hard reload: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear site data:
   - Open DevTools (F12)
   - Application tab → Clear storage → Clear site data

### Issue 4: Environment Variables Not Loading
**Symptoms**: Dev server doesn't pick up `.env.local` changes
**Solution**:
```bash
# Kill all node processes
pkill -f "next dev"

# Restart dev server
npm run dev
```

---

## What I Need From You

Please provide:

1. **Exact error message** from browser console
2. **Screenshot** of the error (if possible)
3. **Response** from Network tab `/api/checkout` request

Or simply tell me what the error says word-for-word!

---

## Quick Test

Try this in your browser console (F12 → Console tab):

```javascript
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ productId: 'test', quantity: 1 }],
    customerEmail: 'test@example.com'
  })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err))
```

This will show the exact API response!

---

**Next**: Share the error message or console output, and I'll fix it immediately! 🚀
