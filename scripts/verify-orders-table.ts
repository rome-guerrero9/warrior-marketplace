import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyOrdersTable() {
  console.log('🔍 Verifying orders table exists...\n')

  try {
    // Check if orders table exists by querying it
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error querying orders table:', error.message)
      console.error('Details:', error)
      return false
    }

    console.log('✅ Orders table exists!')
    console.log(`   Current order count: ${orders?.length || 0}\n`)

    // Check order_items table
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1)

    if (itemsError) {
      console.error('❌ Error querying order_items table:', itemsError.message)
      return false
    }

    console.log('✅ Order_items table exists!')
    console.log(`   Current item count: ${items?.length || 0}\n`)

    // Create a test order to verify the schema
    console.log('📝 Creating test order to verify schema...\n')

    const testOrderNumber = `TEST-${Date.now()}`

    const { data: testOrder, error: createError } = await supabase
      .from('orders')
      .insert({
        order_number: testOrderNumber,
        customer_email: 'test@example.com',
        status: 'pending',
        total_cents: 9900,
        stripe_session_id: 'test_session_id',
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating test order:', createError.message)
      console.error('Details:', createError)
      return false
    }

    console.log('✅ Successfully created test order!')
    console.log('   Order ID:', testOrder.id)
    console.log('   Order Number:', testOrder.order_number)
    console.log('   Status:', testOrder.status)
    console.log('   Total:', `$${testOrder.total_cents / 100}\n`)

    // Test updating order status (simulating webhook)
    console.log('🔄 Testing order status update (simulating webhook)...\n')

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: 'test_payment_intent_id',
      })
      .eq('id', testOrder.id)

    if (updateError) {
      console.error('❌ Error updating order:', updateError.message)
      return false
    }

    console.log('✅ Successfully updated order status to "paid"!\n')

    // Verify the update
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', testOrder.id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching updated order:', fetchError.message)
      return false
    }

    console.log('✅ Verified order update:')
    console.log('   Status:', updatedOrder.status)
    console.log('   Payment Intent ID:', updatedOrder.stripe_payment_intent_id)
    console.log()

    // Clean up test order
    console.log('🧹 Cleaning up test order...\n')

    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', testOrder.id)

    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test order:', deleteError.message)
    } else {
      console.log('✅ Test order cleaned up successfully!\n')
    }

    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

async function main() {
  console.log('========================================')
  console.log('  ORDERS TABLE VERIFICATION')
  console.log('========================================\n')

  const success = await verifyOrdersTable()

  if (success) {
    console.log('========================================')
    console.log('  ✅ ALL CHECKS PASSED')
    console.log('========================================\n')
    console.log('The orders table is properly configured and ready for webhook integration!\n')
    process.exit(0)
  } else {
    console.log('========================================')
    console.log('  ❌ VERIFICATION FAILED')
    console.log('========================================\n')
    console.log('Please check the error messages above and ensure database migrations are applied.\n')
    process.exit(1)
  }
}

main()
