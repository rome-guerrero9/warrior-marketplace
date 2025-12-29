# 🛠️ Helper Scripts Guide

**Automated setup scripts for rapid deployment**

---

## 🚀 Available Scripts

### 1. **Quick Start** - Complete Setup (Recommended)

```bash
./scripts/quick-start.sh
```

**What it does:**
- ✅ Installs all npm dependencies
- ✅ Checks environment variables
- ✅ Tests build
- ✅ Optionally sets up database
- ✅ Ready to run `npm run dev`

**Use when:** First time setup or after cloning repo

---

### 2. **Database Setup** - Supabase Migrations

```bash
./scripts/setup-database.sh
```

**What it does:**
- ✅ Checks/installs Supabase CLI
- ✅ Logs into Supabase
- ✅ Links to your project
- ✅ Runs all 3 database migrations
- ✅ Verifies tables created
- ✅ Optionally adds sample product

**Use when:** Setting up database for the first time

**Note:** You'll need to authenticate in your browser

---

### 3. **Basic Setup** - Dependencies Only

```bash
./scripts/setup.sh
```

**What it does:**
- ✅ Installs npm dependencies
- ✅ Creates .env.local from template
- ✅ Initializes git repository
- ✅ Creates .gitignore

**Use when:** Quick dependency setup without database

---

## 📋 Step-by-Step Launch Guide

### Option A: Fully Automated (Easiest)

```bash
# 1. Run quick start
./scripts/quick-start.sh

# 2. Answer 'y' to database setup prompt

# 3. Authenticate in browser when prompted

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

**Time:** ~5-10 minutes (includes Supabase authentication)

---

### Option B: Manual Database Setup

```bash
# 1. Run basic setup
./scripts/setup.sh

# 2. Edit .env.local with your credentials
nano .env.local

# 3. Run database setup
./scripts/setup-database.sh

# 4. Start dev server
npm run dev
```

**Time:** ~10-15 minutes

---

### Option C: Database Setup Only (Already have dependencies)

```bash
# If you already ran npm install
./scripts/setup-database.sh
```

**Time:** ~5 minutes

---

## 🔧 Script Details

### Quick Start Script

**Location:** `scripts/quick-start.sh`

**Steps:**
1. Checks for package.json (ensures correct directory)
2. Runs `npm install`
3. Verifies .env.local exists (creates from template if missing)
4. Runs test build
5. Offers database setup
6. Shows next steps

---

### Database Setup Script

**Location:** `scripts/setup-database.sh`

**Steps:**
1. Reads Supabase URL from .env.local
2. Extracts project reference
3. Checks for Supabase CLI
4. Installs CLI if missing (macOS: Homebrew, Linux: direct download)
5. Opens browser for Supabase authentication
6. Links to your project
7. Runs migration 1: Initial schema (7 tables)
8. Runs migration 2: Security policies (RLS)
9. Runs migration 3: Database functions
10. Verifies tables created
11. Optionally adds sample product
12. Shows next steps

---

### Basic Setup Script

**Location:** `scripts/setup.sh`

**Steps:**
1. Checks Node.js and npm installed
2. Runs `npm install`
3. Creates .env.local if missing
4. Initializes git if needed
5. Creates .gitignore

---

## ⚠️ Troubleshooting

### "Permission denied"

```bash
chmod +x scripts/*.sh
```

### "Supabase CLI not found" (after script runs)

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### "Cannot link to project"

1. Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
2. Ensure you're logged into the correct Supabase account
3. Check project reference matches your dashboard

### "Migration failed"

1. Check Supabase dashboard for error details
2. Verify you have database access
3. Try running migrations manually in SQL Editor

---

## 🎯 Which Script Should I Use?

| Scenario | Script | Time |
|----------|--------|------|
| **First time setup (have credentials)** | `quick-start.sh` | 5-10 min |
| **First time setup (no credentials)** | `setup.sh` | 2 min |
| **Database only (dependencies installed)** | `setup-database.sh` | 5 min |
| **Just dependencies** | `setup.sh` | 2 min |
| **Fresh clone from git** | `quick-start.sh` | 5-10 min |

---

## 📖 Manual Alternative

If scripts don't work, follow these manual steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
nano .env.local  # Add your credentials
```

### 3. Set Up Database (Manual)

Go to: https://supabase.com/dashboard → Your Project → SQL Editor

Run each migration file in order:
1. `supabase/migrations/20231201000000_initial_schema.sql`
2. `supabase/migrations/20231201000001_rls_policies.sql`
3. `supabase/migrations/20231201000002_functions.sql`

### 4. Start Dev Server
```bash
npm run dev
```

---

## 🚀 After Setup

Once scripts complete:

1. **Start dev server:** `npm run dev`
2. **Open browser:** http://localhost:3000
3. **Set up webhooks:** See LAUNCH_CHECKLIST.md
4. **Test checkout:** Use Stripe test card

---

## 📞 Need Help?

- **Detailed setup:** See SETUP_GUIDE.md
- **Launch checklist:** See LAUNCH_CHECKLIST.md
- **Quick reference:** See QUICK_REFERENCE.md

---

**Scripts created by:** Warrior AI Automations
**Last updated:** December 25, 2025
