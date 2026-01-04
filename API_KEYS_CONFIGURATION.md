# Warrior Marketplace - API Keys Configuration Guide
**Project**: Warrior AI Marketplace
**Date**: 2025-01-04
**Status**: Required for Production Deployment

---

## 🔑 Required API Keys

### 1. Supabase Configuration

#### SUPABASE_URL
**Purpose**: Connects to your Supabase PostgreSQL database
**How to Get**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create new one)
3. Go to Settings → API
4. Copy "Project URL"

**Example Format**:
```
https://your-project-ref.supabase.co
```

**Environment Variable**:
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
```

---

#### SUPABASE_ANON_KEY
**Purpose**: Public client-side key for frontend queries
**Security**: Safe to expose in client code (Row Level Security protects data)

**How to Get**:
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key

**Example Format**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.example-signature
```

**Environment Variable**:
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### SUPABASE_SERVICE_ROLE_KEY ⚠️ CRITICAL
**Purpose**: Server-side admin key - bypasses Row Level Security
**Security**: ⚠️ **NEVER expose in client code** - server-only
**Permissions**: Full database access, user management, admin operations

**How to Get**:
1. Supabase Dashboard → Settings → API
2. Copy "service_role secret" key
3. ⚠️ Keep this SECRET - treat like database root password

**Example Format**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE5MzE3Mzc2MTZ9.example-service-signature
```

**Environment Variable**:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where It's Used**:
- Admin product management
- User role assignments
- Server-side database operations
- Bypassing RLS for admin tasks

---

### 2. Stripe Payment Processing

#### STRIPE_PUBLISHABLE_KEY
**Purpose**: Client-side Stripe.js initialization
**Security**: Safe to expose (public key)

**How to Get**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API Keys
3. Copy "Publishable key"
4. **Use Test key for development**: `pk_test_...`
5. **Use Live key for production**: `pk_live_...`

**Example Format**:
```
pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
```

**Environment Variable**:
```bash
# Development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

#### STRIPE_SECRET_KEY ⚠️ CRITICAL
**Purpose**: Server-side payment processing and webhook verification
**Security**: ⚠️ **NEVER expose in client code** - server-only
**Permissions**: Create charges, refunds, subscriptions, access customer data

**How to Get**:
1. Stripe Dashboard → Developers → API Keys
2. Copy "Secret key"
3. **Use Test key for development**: `sk_test_...`
4. **Use Live key for production**: `sk_live_...`
5. ⚠️ Keep this SECRET - treat like bank account access

**Example Format**:
```
sk_test_YOUR_STRIPE_TEST_KEY_HERE
# Real keys start with sk_test_ followed by 99 characters
```

**Environment Variable**:
```bash
# Development
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...
```

**Where It's Used**:
- Processing payments
- Creating subscriptions
- Handling refunds
- Webhook signature verification
- Customer portal sessions

---

#### STRIPE_WEBHOOK_SECRET ⚠️ CRITICAL
**Purpose**: Verify webhook events are actually from Stripe
**Security**: ⚠️ Server-only - prevents webhook spoofing attacks

**How to Get**:
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy "Signing secret" (starts with `whsec_`)

**Example Format**:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
```

**Environment Variable**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where It's Used**:
- Verifying webhook authenticity
- Processing subscription events
- Handling payment confirmations

---

## 📁 Environment File Setup

### Development (.env.local)
Create `/home/romex/projects/warrior-marketplace/.env.local`:

```bash
# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### Production (Vercel Environment Variables)
**Deployment**: When deploying to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SUPABASE_URL` | https://your-project.supabase.co | Production |
| `SUPABASE_ANON_KEY` | eyJhbGci... (anon key) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... (service role) | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_... | Production |
| `STRIPE_SECRET_KEY` | sk_live_... | Production |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | Production |
| `NEXT_PUBLIC_APP_URL` | https://warrior-marketplace.vercel.app | Production |

**Important**: Use LIVE keys for production, TEST keys for development

---

## 🔒 Security Best Practices

### ✅ DO
- ✅ Store API keys in `.env.local` (gitignored)
- ✅ Use test keys during development
- ✅ Use environment variables in Vercel for production
- ✅ Rotate keys if ever exposed
- ✅ Use different keys for dev/staging/production
- ✅ Keep service role and secret keys SERVER-SIDE ONLY
- ✅ Enable Stripe webhook signature verification

### ❌ DON'T
- ❌ Commit API keys to git
- ❌ Expose secret keys in client-side code
- ❌ Share keys in Slack/email
- ❌ Use production keys in development
- ❌ Hard-code keys in source files
- ❌ Screenshot keys and share publicly

---

## 🧪 Testing Your Configuration

### 1. Test Supabase Connection
```bash
cd /home/romex/projects/warrior-marketplace
npm run dev

# Should connect successfully
# Check browser console - no Supabase errors
```

### 2. Test Stripe Connection
**Test Card**: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Process Test Payment**:
1. Add product to cart
2. Go to checkout
3. Use test card
4. Should complete successfully
5. Check Stripe Dashboard → Payments

### 3. Test Webhook
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed

# Should see webhook received in terminal
```

---

## 🚨 Troubleshooting

### "Invalid API Key" Error
**Cause**: Wrong key or key not set
**Fix**:
- Check `.env.local` has correct keys
- Restart Next.js dev server (`npm run dev`)
- Verify keys in Supabase/Stripe dashboards

### "Unauthorized" Error
**Cause**: Using wrong key type (anon instead of service role)
**Fix**: Use `SUPABASE_SERVICE_ROLE_KEY` for admin operations

### Stripe Webhook Not Working
**Cause**: Webhook secret mismatch
**Fix**:
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Ensure webhook is active in Stripe

### Database Connection Failed
**Cause**: Wrong Supabase URL or network issue
**Fix**:
- Verify `SUPABASE_URL` is correct
- Check Supabase project is active
- Test connection from Supabase Dashboard SQL editor

---

## 📋 Deployment Checklist

Before going to production:

- [ ] Create production Supabase project
- [ ] Get production Supabase keys
- [ ] Activate Stripe live mode
- [ ] Get Stripe live keys
- [ ] Set up production webhook endpoint
- [ ] Get webhook signing secret
- [ ] Add all environment variables to Vercel
- [ ] Test payment flow with real card
- [ ] Verify webhook events are received
- [ ] Set up monitoring/alerts

---

## 💡 Quick Start Commands

```bash
# 1. Create environment file
cd /home/romex/projects/warrior-marketplace
cp .env.example .env.local

# 2. Edit with your keys
nano .env.local

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Created for Rome Guerrero | Warrior AI Automations**
**Last Updated**: 2025-01-04
