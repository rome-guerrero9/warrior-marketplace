import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const stripeKey = process.env.STRIPE_SECRET_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

async function testWebhookWithRealSession() {
  console.log('========================================')
  console.log('  REAL STRIPE SESSION WEBHOOK TEST')
  console.log('========================================\n')

  console.log('📝 Step 1: Creating test order in database...\n')

  const testOrderNumber = `TEST-REAL-${Date.now()}`
  const testEmail = 'test-real@example.com'

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
  console.log('   Status:', testOrder.status, '\n')

  console.log('💳 Step 2: Creating REAL Stripe checkout session...\n')

  try {
    // Create a real Stripe checkout session with our order_id in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Product - Webhook Flow',
          },
          unit_amount: 9900, // $99.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        order_id: testOrder.id, // THIS is how we link Stripe session to our order
      },
    })

    console.log('✅ Stripe session created!')
    console.log('   Session ID:', session.id)
    console.log('   Metadata:', session.metadata)
    console.log('   Status:', session.status)
    console.log()

    // Update our order with the Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', testOrder.id)

    console.log('📋 MANUAL TEST REQUIRED:\n')
    console.log('To complete this test, you need to:')
    console.log('1. Make sure Stripe webhook listener is running:')
    console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe\n')
    console.log('2. Open Stripe Dashboard and mark the session as completed:')
    console.log(`   https://dashboard.stripe.com/test/checkout-sessions/${session.id}\n`)
    console.log('3. Or use Stripe CLI to trigger the event:')
    console.log(`   stripe trigger checkout.session.completed --override checkout_session:id=${session.id}\n`)
    console.log('4. Check dev server logs for [Webhook] messages\n')
    console.log('5. Then run this verification:')
    console.log(`   npx tsx scripts/verify-order-status.ts ${testOrder.id}\n`)

    console.log('⏳ Waiting 10 seconds for you to trigger the event...\n')

    // Wait for manual trigger
    await new Promise(resolve => setTimeout(resolve, 10000))

    console.log('🔍 Step 3: Checking order status...\n')

    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', testOrder.id)
      .single()

    if (updatedOrder) {
      console.log('📊 Order Status:')
      console.log('   Status:', updatedOrder.status)
      console.log('   Payment Intent:', updatedOrder.stripe_payment_intent_id || '(not set)')
      console.log()

      if (updatedOrder.status === 'paid') {
        console.log('✅ SUCCESS! Webhook processed correctly!\n')

        // Clean up
        console.log('🧹 Cleaning up test order...')
        await supabase.from('orders').delete().eq('id', testOrder.id)
        console.log('✅ Cleaned up\n')

        return true
      } else {
        console.log(`⚠️  Order status is "${updatedOrder.status}", not "paid"`)
        console.log('The webhook may not have processed yet or there was an error.\n')
        console.log('Leaving test order in database for manual inspection.')
        console.log(`Order ID: ${testOrder.id}\n`)
        return false
      }
    }

    return false

  } catch (error: any) {
    console.error('❌ Error creating Stripe session:', error.message)

    // Clean up test order
    await supabase.from('orders').delete().eq('id', testOrder.id)

    return false
  }
}

async function main() {
  const success = await testWebhookWithRealSession()

  console.log('========================================')
  if (success) {
    console.log('  ✅ TEST PASSED')
  } else {
    console.log('  ⚠️  TEST INCOMPLETE OR FAILED')
  }
  console.log('========================================\n')

  process.exit(success ? 0 : 1)
}

main()
