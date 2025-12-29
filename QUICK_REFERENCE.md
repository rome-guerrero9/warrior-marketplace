# Warrior AI Marketplace - Quick Reference

**One-page reference for common commands and configurations**

---

## 📁 Project Location

```bash
/home/romex/projects/warrior-marketplace/
```

---

## 🚀 Quick Start

```bash
# Navigate to project
cd /home/romex/projects/warrior-marketplace

# Run automated setup
./scripts/setup.sh

# Install dependencies (if not using setup script)
npm install

# Start development server
npm run dev
```

Access at: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Domains

- **Primary**: warrioraiautomations.com
- **Secondary**: warriorautomations.com (redirects to primary)

---

## 🔑 Environment Variables

Located in `.env.local` (create from `.env.example`):

```bash
# Core Services
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional AI Features
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

## 📦 NPM Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🗄️ Database Commands

```bash
# Using Supabase CLI
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push  # Run migrations

# Manual migration in Supabase SQL Editor
# 1. Copy contents of supabase/migrations/*.sql
# 2. Paste in SQL Editor
# 3. Execute
```

---

## 💳 Stripe Testing

```bash
# Start webhook forwarding (local development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test card numbers
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# 3D Secure: 4000 0027 6000 3184
```

---

## 🔄 Git Workflow

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/warrior-marketplace.git
git push -u origin main
```

---

## 🚢 Deployment

### Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel login
vercel  # Deploy

# Option 2: GitHub Integration
# 1. Push to GitHub
# 2. Import in Vercel dashboard
# 3. Configure environment variables
# 4. Deploy
```

### Environment Variables in Vercel

Settings → Environment Variables → Add all from `.env.local`

---

## 📊 Database Schema

```sql
-- 7 tables
profiles       -- User accounts
products       -- Digital products
orders         -- Order tracking
order_items    -- Line items
downloads      -- Download links
reviews        -- Product reviews
carts          -- Abandoned carts

-- Key functions
generate_order_number()
search_products(query)
get_product_recommendations(product_id)
get_revenue_analytics(start_date, end_date)
```

---

## 🛠️ Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | Next.js 14 | Free |
| Hosting | Vercel Free | $0/mo |
| Database | Supabase | $0/mo |
| Payments | Stripe | 2.9% + $0.30 |
| Email | Resend | $0/mo |
| AI | Claude 3.5 Haiku | ~$0.002/conv |
| CDN | Cloudflare | $0/mo |
| Domain | Any registrar | $12/year |

---

## 📂 Project Structure

```
warrior-marketplace/
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # React components
│   ├── ui/              # Base components
│   ├── product/         # Product components
│   └── cart/            # Cart components
├── lib/                  # Utilities
│   ├── supabase/        # DB clients
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helpers
├── supabase/migrations/  # Database migrations
├── .github/workflows/    # CI/CD pipelines
└── scripts/             # Setup scripts
```

---

## 🔍 Common Issues

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Common fix: regenerate types
npx supabase gen types typescript --project-id YOUR_PROJECT_REF
```

### Webhook Not Working

```bash
# Verify webhook secret
stripe listen --print-secret

# Test webhook locally
stripe trigger checkout.session.completed
```

---

## 📈 Success Metrics

- **Week 2**: First sale target
- **Month 1**: $2,500 MRR
- **Month 3**: $10,000 MRR
- **Month 6**: $30,000+ MRR

---

## 🔗 Important Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Resend Dashboard](https://resend.com/emails)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

---

## 📞 Support

- **Documentation**: README.md | SETUP_GUIDE.md
- **Email**: support@warrioraiautomations.com

---

**Last Updated**: December 25, 2025
**Version**: 1.0.0 (Production-Ready MVP)
