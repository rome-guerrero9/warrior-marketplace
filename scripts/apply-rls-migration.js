/**
 * Apply RLS Migration to stripe_events Table
 *
 * This script executes the RLS migration using direct PostgreSQL connection.
 *
 * Usage:
 * 1. Get your database password from Supabase Dashboard:
 *    Project Settings → Database → Connection string → Password
 *
 * 2. Run the script:
 *    DATABASE_PASSWORD="your_password" node scripts/apply-rls-migration.js
 *
 * OR set DATABASE_URL in .env.local:
 *    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dhlhnhacvwylrdxdlnqs.supabase.co:5432/postgres"
 *    node scripts/apply-rls-migration.js
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

async function applyRLSMigration() {
  // Construct database URL
  const projectRef = 'dhlhnhacvwylrdxdlnqs'
  const password = process.env.DATABASE_PASSWORD || process.env.SUPABASE_DB_PASSWORD

  let connectionString = process.env.DATABASE_URL

  if (!connectionString && password) {
    connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`
  }

  if (!connectionString) {
    console.error('❌ Error: Database connection string not found')
    console.error('')
    console.error('Please provide database credentials using one of these methods:')
    console.error('')
    console.error('1. Set DATABASE_PASSWORD environment variable:')
    console.error('   DATABASE_PASSWORD="your_password" node scripts/apply-rls-migration.js')
    console.error('')
    console.error('2. Set DATABASE_URL in .env.local:')
    console.error('   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.dhlhnhacvwylrdxdlnqs.supabase.co:5432/postgres"')
    console.error('')
    console.error('Get your password from: Supabase Dashboard → Project Settings → Database')
    process.exit(1)
  }

  console.log('🔗 Connecting to Supabase PostgreSQL database...')

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  })

  try {
    await client.connect()
    console.log('✅ Connected successfully')
    console.log('')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260108000000_enable_stripe_events_rls.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📜 Applying RLS migration to stripe_events table...')
    console.log('')

    // Execute the migration
    await client.query(migrationSQL)

    console.log('✅ RLS migration applied successfully!')
    console.log('')
    console.log('The following security policies are now active:')
    console.log('  ✓ Row Level Security enabled on stripe_events')
    console.log('  ✓ Service role can insert stripe events')
    console.log('  ✓ Service role can read stripe events')
    console.log('  ✓ Admins can read stripe events')
    console.log('')
    console.log('🎉 Payment page should now work correctly!')

  } catch (error) {
    console.error('❌ Error applying migration:')
    console.error(error.message)
    console.error('')

    if (error.message.includes('already exists')) {
      console.log('ℹ️  Note: Some policies may already exist. This is normal if you\'ve run this script before.')
      console.log('The stripe_events table should now have RLS enabled.')
    } else if (error.message.includes('password authentication failed')) {
      console.error('Check that your database password is correct.')
      console.error('Get it from: Supabase Dashboard → Project Settings → Database')
    } else {
      console.error('You may need to apply the migration manually:')
      console.error('1. Go to Supabase Dashboard → SQL Editor')
      console.error('2. Run the contents of: supabase/migrations/20260108000000_enable_stripe_events_rls.sql')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the migration
applyRLSMigration()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
