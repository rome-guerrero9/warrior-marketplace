# 🚀 Warrior AI Marketplace

**AI-powered digital marketplace built with Next.js 14, Supabase, and Stripe**

A complete marketplace platform for selling digital products and SaaS subscriptions. Built by Rome Guerrero | Warrior AI Automations.

---

## 📦 Current Products (6 Total)

### MCP Server Marketplace (3 Tiers)
Professional Model Context Protocol servers for Claude Code:

- **FREE**: Starter Pack - 3 essential servers
- **$9/month**: Pro Pack - 10 professional servers
- **$29/month**: Agency Suite - Unlimited servers + Kali Security Suite

### AgentFlow Pro SaaS (3 Tiers)
AI-powered agency automation platform:

- **$29/month**: Starter - 5 clients, basic automation
- **$79/month**: Professional - 25 clients, advanced features (MOST POPULAR)
- **$199/month**: Agency - Unlimited clients, enterprise support

---

## ✅ Status

**Build**: ✅ Passing (0 vulnerabilities)
**Database**: ✅ Schema ready (7 tables)
**Payments**: ✅ Stripe integrated (test + production)
**Products**: ✅ 6 products ready to deploy
**Downloads**: ✅ Digital delivery configured

**Progress**: 95% complete - Ready to launch!

---

## 🚀 Quick Start (30 minutes)

### 1. Prerequisites

- Node.js 20+
- Supabase account
- Stripe account
- Git

### 2. Installation

```bash
git clone <your-repo>
cd warrior-marketplace
npm install
```

### 3. Environment Setup

Copy `.env.local` template and fill in your credentials:

```bash
# Already configured in your project!
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dhlhnhacvwylrdxdlnqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get from stripe listen)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run migrations in Supabase SQL Editor:

```bash
# 1. Go to: https://supabase.com/dashboard → SQL Editor
# 2. Run these files in order:
supabase/migrations/20231201000000_initial_schema.sql
supabase/migrations/20231201000001_rls_policies.sql
supabase/migrations/20231201000002_functions.sql
scripts/setup-vendor-and-products.sql
```

### 5. Upload Products to Storage

```bash
npm install dotenv @supabase/supabase-js
node scripts/upload-to-storage.js
```

### 6. Start Development

```bash
npm run dev
```

Open http://localhost:3000 - Your marketplace is live!

---

## 📚 Documentation

**Setup Guides**:
- **QUICK_START_GUIDE.md** - 30-minute setup (START HERE!)
- **PRODUCT_SETUP_COMPLETE.md** - Comprehensive product setup
- **SETUP_GUIDE.md** - Original detailed setup
- **LAUNCH_CHECKLIST.md** - Production deployment checklist

**Reference Docs**:
- **CURRENT_STATUS.md** - Current project status
- **DATABASE_SETUP_INSTRUCTIONS.md** - Database configuration
- **SCRIPTS_GUIDE.md** - Helper scripts documentation

**Project Info**:
- **PROJECT_SUMMARY.md** - Architecture overview
- **PROJECT_PLAN.md** - Development roadmap
- **QUICK_REFERENCE.md** - Common commands

---

## 🏗️ Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components

**Backend**:
- Supabase (PostgreSQL + Auth + Storage)
- Stripe (Payments + Subscriptions)
- Next.js API routes

**Infrastructure**:
- Vercel (Hosting)
- Supabase (Database + Storage)
- Stripe (Payment processing)
- Cloudflare (DNS + CDN)

---

## 📊 Database Schema

7 tables designed for 100,000+ orders:

```
profiles         - User accounts (vendors + customers)
products         - Digital products and subscriptions
orders           - Order records
order_items      - Line items per order
downloads        - Download delivery tracking
reviews          - Product reviews and ratings
carts            - Shopping cart (abandoned cart recovery)
```

**Storage**: ~110MB for 100K orders (22% of free tier)

---

## 🔐 Security Features

- Row Level Security (RLS) policies on all tables
- Service role key for admin operations
- Secure file downloads with expiration
- Stripe webhook signature verification
- Input validation and sanitization
- Environment variable protection

---

## 🎯 Features

### For Customers
- Browse digital products and SaaS subscriptions
- Add to cart and checkout
- Stripe payment processing
- Instant digital downloads
- Order history
- Product reviews

### For Vendors
- Product management
- Order tracking
- Revenue analytics
- Customer insights
- Download analytics

### For Admins
- Full database access
- Stripe dashboard integration
- Order management
- User management
- Analytics and reporting

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Launch Warrior Marketplace"
git push origin main

# 2. Import to Vercel
# Visit: https://vercel.com/new
# Connect GitHub repo
# Add environment variables from .env.local
# Deploy!

# 3. Set up production Stripe webhook
# Stripe Dashboard → Webhooks → Add endpoint
# URL: https://your-domain.vercel.app/api/webhooks/stripe
# Events: checkout.session.completed, payment_intent.payment_failed
# Copy webhook secret → Add to Vercel env vars
```

### Custom Domain

```bash
# 1. Add domain in Vercel: Settings → Domains
# 2. Configure DNS in Cloudflare:
#    A record: @ → 76.76.21.21
#    CNAME: www → cname.vercel-dns.com
# 3. Enable SSL (automatic in Vercel)
# 4. Update NEXT_PUBLIC_APP_URL in Vercel env vars
```

---

## 📈 Revenue Tracking

### Week 1 Conservative Goals
- MCP FREE: 50-100 downloads (email list)
- MCP Pro ($9/mo): 3-5 = $27-45 MRR
- MCP Agency ($29/mo): 1-2 = $29-58 MRR
- AgentFlow Starter ($29/mo): 2-3 = $58-87 MRR
- AgentFlow Pro ($79/mo): 1-2 = $79-158 MRR
- AgentFlow Agency ($199/mo): 0-1 = $0-199 MRR

**Total Week 1 MRR**: $193-547
**Month 1 Goal**: $1,000-2,000 MRR
**Gumroad Commission Saved**: 10% = $100-200/month

---

## 🧪 Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test checkout with Stripe test card
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Webhook Testing

```bash
# Terminal 1: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Dev server
npm run dev

# Complete a test purchase
# Check Terminal 1 for webhook events
```

### Build Testing

```bash
npm run build
npm start
```

---

## 🆘 Troubleshooting

### Products not showing?
```sql
-- Check database
SELECT COUNT(*) FROM products WHERE status = 'active';
-- Should return 6
```

### Stripe checkout failing?
- Verify test keys in `.env.local`
- Check webhook is running (stripe listen)
- Look for errors in browser console
- Check `/app/api/checkout/route.ts`

### Download links broken?
- Verify files in Supabase Storage: `products/downloads/`
- Check bucket is PUBLIC
- Test URL directly in browser
- Verify download_url in products table

### Build errors?
```bash
rm -rf .next
npm run build
```

---

## 🎨 Customization

### Add New Products

```sql
INSERT INTO products (
  vendor_id, name, slug, description,
  price_cents, category, status, images, download_url
) VALUES (
  'your_vendor_id', 'Product Name', 'product-slug', 'Description',
  2900, 'Category', 'active', ARRAY['image_url'], 'download_url'
);
```

### Update Styling

- Colors: `tailwind.config.ts`
- Components: `components/`
- Layouts: `app/layout.tsx`
- Homepage: `app/page.tsx`

---

## 📞 Support

**Creator**: Rome Guerrero
**Company**: Warrior AI Automations
**Email**: rome@warrioraiautomations.com
**Website**: warrioraiautomations.com

**Issues**: Create an issue in GitHub
**Documentation**: See `/docs` folder

---

## 🎯 Roadmap

### Q1 2025
- [x] Core marketplace functionality
- [x] Stripe payment integration
- [x] Digital download delivery
- [x] 6 initial products
- [ ] Production deployment
- [ ] Custom domain setup
- [ ] First 10 customers

### Q2 2025
- [ ] User dashboard
- [ ] Product reviews system
- [ ] Advanced analytics
- [ ] Email marketing integration
- [ ] Abandoned cart recovery
- [ ] Affiliate program

### Q3 2025
- [ ] Mobile app (React Native)
- [ ] Advanced search and filters
- [ ] Recommendation engine
- [ ] Multi-vendor support
- [ ] API for third-party integrations

---

## 📜 License

Private - All Rights Reserved
© 2025 Warrior AI Automations

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

---

## 📈 Stats

**Lines of Code**: ~3,000+
**Components**: 15+
**API Routes**: 2
**Database Tables**: 7
**Migrations**: 4
**Build Time**: ~12 seconds
**Bundle Size**: 87.2 kB (First Load JS)

---

**Ready to launch your digital empire! 🚀**

*Version 1.0 - December 2025*
*Rome Guerrero | Warrior AI Automations*
