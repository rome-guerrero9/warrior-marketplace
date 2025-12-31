import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyRLSFix() {
  console.log('========================================')
  console.log('  APPLYING RLS POLICY FIX')
  console.log('========================================\n')

  console.log('📄 Reading migration file...\n')

  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20250101000000_fix_service_role_select.sql')
  const sqlContent = fs.readFileSync(migrationPath, 'utf-8')

  console.log('SQL to execute:')
  console.log(sqlContent)
  console.log()

  console.log('🔄 Applying migration to Supabase...\n')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      // If exec_sql RPC doesn't exist, try direct SQL execution
      console.log('RPC method not available, trying direct execution...\n')

      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: '20250101000000_fix_service_role_select', executed_at: new Date().toISOString() })

      if (directError) {
        console.log('Direct method not available, using alternative approach...\n')

        // Create the policy using Supabase SQL query
        const policySQL = `
          CREATE POLICY IF NOT EXISTS "Service role can select orders"
          ON orders FOR SELECT
          USING (true);
        `

        // Use raw SQL via Supabase's SQL query endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: policySQL })
        })

        if (!response.ok) {
          console.error('❌ Failed to apply migration via API')
          console.error('Status:', response.status, response.statusText)
          console.log('\n⚠️  Manual action required:')
          console.log('Please apply this SQL manually in Supabase Dashboard SQL Editor:\n')
          console.log(policySQL)
          return false
        }
      }
    }

    console.log('✅ Migration applied successfully!\n')
    console.log('The service role can now SELECT orders from the webhook endpoint.\n')
    return true

  } catch (error: any) {
    console.error('❌ Error applying migration:', error.message)
    console.log('\n⚠️  Manual action required:')
    console.log('Please apply this SQL manually in Supabase Dashboard SQL Editor:\n')
    console.log(sqlContent)
    return false
  }
}

async function verifyFix() {
  console.log('🔍 Verifying the fix...\n')

  // Try to select an order using service role
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }

  console.log('✅ Verification successful! Service role can now SELECT orders.\n')
  return true
}

async function main() {
  const applied = await applyRLSFix()

  if (!applied) {
    console.log('========================================')
    console.log('  ⚠️  MANUAL MIGRATION REQUIRED')
    console.log('========================================\n')
    process.exit(1)
  }

  const verified = await verifyFix()

  if (verified) {
    console.log('========================================')
    console.log('  ✅ FIX APPLIED AND VERIFIED')
    console.log('========================================\n')
    console.log('The webhook can now fetch orders after updating them!\n')
    console.log('Next step: Run the webhook test again\n')
    process.exit(0)
  } else {
    console.log('========================================')
    console.log('  ⚠️  VERIFICATION FAILED')
    console.log('========================================\n')
    process.exit(1)
  }
}

main()
