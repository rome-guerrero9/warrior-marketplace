import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function applyRLSPolicy() {
  console.log('========================================')
  console.log('  APPLYING RLS POLICY FIX')
  console.log('========================================\n')

  console.log('🔧 Using Supabase Management API to apply policy...\n')

  const policySQL = `
    CREATE POLICY IF NOT EXISTS "Service role can select orders"
    ON orders FOR SELECT
    USING (true);
  `

  try {
    // Extract project reference from URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

    if (!projectRef) {
      throw new Error('Could not extract project reference from Supabase URL')
    }

    console.log('Project Reference:', projectRef)
    console.log('Executing SQL policy creation...\n')

    // Use Supabase's REST API to execute SQL
    // The service role key allows direct SQL execution via the PostgREST /rpc endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: policySQL.trim()
      })
    })

    if (response.status === 404) {
      // exec_sql RPC doesn't exist, we need alternative approach
      console.log('⚠️  Direct SQL execution not available via RPC')
      console.log('Attempting alternative method using pg_policy catalog...\n')

      // Check if policy already exists by querying pg_policies
      const { data: existingPolicies, error: checkError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'orders')
        .eq('policyname', 'Service role can select orders')

      if (checkError) {
        console.log('Unable to check existing policies:', checkError.message)
        throw new Error('Cannot verify policy status. Manual application required.')
      }

      if (existingPolicies && existingPolicies.length > 0) {
        console.log('✅ Policy already exists!')
        console.log('   Policy Name:', existingPolicies[0].policyname)
        console.log('   Command:', existingPolicies[0].cmd)
        return true
      }

      // Policy doesn't exist and we can't create it programmatically
      throw new Error('Policy does not exist and cannot be created via API')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ SQL executed successfully!')
    console.log('Result:', result)

    return true

  } catch (error: any) {
    console.error('❌ Automated application failed:', error.message)
    console.log('\n📋 Manual Application Required:\n')
    console.log('Please run this SQL in Supabase Dashboard SQL Editor:')
    console.log('─'.repeat(60))
    console.log(policySQL.trim())
    console.log('─'.repeat(60))
    console.log('\nSteps:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your Warrior Marketplace project')
    console.log('3. Click "SQL Editor" in the left sidebar')
    console.log('4. Paste the SQL above')
    console.log('5. Click "Run"')
    console.log()

    return false
  }
}

async function verifyPolicy() {
  console.log('\n🔍 Verifying policy application...\n')

  try {
    // Test if service role can now SELECT orders
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .limit(1)

    if (error) {
      console.error('❌ Verification failed:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      return false
    }

    console.log('✅ Verification successful!')
    console.log('   Service role can SELECT from orders table')
    console.log('   Sample query returned', data?.length || 0, 'results')

    return true

  } catch (error: any) {
    console.error('❌ Verification error:', error.message)
    return false
  }
}

async function main() {
  console.log('Starting RLS policy fix application...\n')

  // First, verify current state
  console.log('📊 Pre-check: Testing current SELECT permissions...\n')
  const canSelectBefore = await verifyPolicy()

  if (canSelectBefore) {
    console.log('\n✅ Service role can already SELECT orders!')
    console.log('The policy may have been applied previously.')
    console.log('\n========================================')
    console.log('  ✅ NO ACTION NEEDED')
    console.log('========================================\n')
    process.exit(0)
  }

  console.log('Service role cannot SELECT orders - applying fix...\n')

  // Apply the policy
  const applied = await applyRLSPolicy()

  if (!applied) {
    console.log('\n========================================')
    console.log('  ⚠️  MANUAL ACTION REQUIRED')
    console.log('========================================\n')
    process.exit(1)
  }

  // Verify it worked
  const verified = await verifyPolicy()

  if (verified) {
    console.log('\n========================================')
    console.log('  ✅ SUCCESS - POLICY APPLIED')
    console.log('========================================\n')
    console.log('The webhook can now fetch orders after updating them!')
    console.log('\nNext step: Run webhook test to verify end-to-end flow\n')
    process.exit(0)
  } else {
    console.log('\n========================================')
    console.log('  ⚠️  VERIFICATION FAILED')
    console.log('========================================\n')
    console.log('The policy may have been created but verification failed.')
    console.log('Try running the webhook test to see if it works.\n')
    process.exit(1)
  }
}

main()
