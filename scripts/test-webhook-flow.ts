import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testWebhookFlow() {
  console.log('========================================')
  console.log('  STRIPE WEBHOOK TEST')
  console.log('========================================\n')

  console.log('📝 Step 1: Creating test order in database...\n')

  const testOrderNumber = `TEST-WEBHOOK-${Date.now()}`
  const testEmail = 'test-webhook@example.com'

  const { data: testOrder, error: createError } = await supabase
    .from('orders')
    .insert({
      order_number: testOrderNumber,
      customer_email: testEmail,
      status: 'pending',
      total_cents: 9900,
    })
    .select()
    .single()

  if (createError) {
    console.error('❌ Error creating test order:', createError.message)
    return false
  }

  console.log('✅ Test order created!')
  console.log('   Order ID:', testOrder.id)
  console.log('   Order Number:', testOrder.order_number)
  console.log('   Status:', testOrder.status)
  console.log('   Total:', `$${testOrder.total_cents / 100}\n`)

  console.log('🔔 Step 2: Triggering Stripe webhook event...\n')
  console.log('   Event: checkout.session.completed')
  console.log('   Metadata: order_id =', testOrder.id, '\n')

  try {
    // Trigger a checkout.session.completed event with the order_id in metadata
    const command = `stripe trigger checkout.session.completed --add checkout_session:metadata[order_id]=${testOrder.id}`

    console.log('   Executing:', command, '\n')

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe'
    })

    console.log('✅ Stripe event triggered!')
    console.log('   Response:', output.trim(), '\n')

    // Wait for webhook to process
    console.log('⏳ Step 3: Waiting for webhook to process (3 seconds)...\n')
    await sleep(3000)

    // Verify the order was updated
    console.log('🔍 Step 4: Verifying order status update...\n')

    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', testOrder.id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching updated order:', fetchError.message)
      return false
    }

    console.log('📊 Order Details After Webhook:')
    console.log('   ID:', updatedOrder.id)
    console.log('   Order Number:', updatedOrder.order_number)
    console.log('   Status:', updatedOrder.status)
    console.log('   Payment Intent ID:', updatedOrder.stripe_payment_intent_id || '(not set)')
    console.log()

    if (updatedOrder.status === 'paid') {
      console.log('✅ SUCCESS! Webhook updated order status to "paid"!\n')
    } else {
      console.log(`⚠️  WARNING: Order status is "${updatedOrder.status}", expected "paid"\n`)
      console.log('This might indicate the webhook did not process correctly.')
      console.log('Check the webhook logs and dev server output for errors.\n')
    }

    // Clean up test order
    console.log('🧹 Step 5: Cleaning up test order...\n')

    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', testOrder.id)

    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test order:', deleteError.message)
    } else {
      console.log('✅ Test order cleaned up successfully!\n')
    }

    return updatedOrder.status === 'paid'

  } catch (error: any) {
    console.error('❌ Error triggering Stripe event:', error.message)
    console.error('   Make sure Stripe CLI is authenticated and listening')
    console.error('   Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe\n')

    // Clean up test order
    await supabase.from('orders').delete().eq('id', testOrder.id)

    return false
  }
}

async function main() {
  const success = await testWebhookFlow()

  console.log('========================================')
  if (success) {
    console.log('  ✅ WEBHOOK TEST PASSED')
    console.log('========================================\n')
    console.log('The Stripe webhook is properly configured and working!\n')
    console.log('Next steps:')
    console.log('1. Configure the webhook in Stripe Dashboard for production')
    console.log('2. Test end-to-end payment flow with real checkout\n')
    process.exit(0)
  } else {
    console.log('  ❌ WEBHOOK TEST FAILED')
    console.log('========================================\n')
    console.log('Please check:')
    console.log('1. Dev server is running (npm run dev)')
    console.log('2. Stripe CLI is listening (stripe listen --forward-to localhost:3000/api/webhooks/stripe)')
    console.log('3. STRIPE_WEBHOOK_SECRET in .env.local matches Stripe CLI output')
    console.log('4. Check webhook endpoint logs for errors\n')
    process.exit(1)
  }
}

main()
