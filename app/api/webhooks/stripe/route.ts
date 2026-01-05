import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { validateEnv } from '@/lib/env'
import { getStripeClient } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  // Validate env vars first
  validateEnv()

  // Get Stripe client singleton (now with consistent timeout/retry config)
  const stripe = getStripeClient()

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        console.log('[Webhook] checkout.session.completed received')
        console.log('[Webhook] Session metadata:', session.metadata)
        console.log('[Webhook] Order ID from metadata:', orderId)

        if (!orderId) {
          console.error('[Webhook] No order_id in session metadata')
          break
        }

        // Update order status to paid
        console.log('[Webhook] Updating order status to paid...')
        const { data: updateData, error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', orderId)
          .select()

        if (updateError) {
          console.error('[Webhook] Error updating order:', updateError)
          break
        }

        console.log('[Webhook] Order update result:', updateData)

        // Get order details for fulfillment
        console.log('[Webhook] Fetching order for fulfillment...')
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single()

        if (fetchError) {
          console.error('[Webhook] Error fetching order:', fetchError)
          break
        }

        if (!order) {
          console.error('[Webhook] Order not found:', orderId)
          break
        }

        console.log('[Webhook] Order fetched successfully:', { id: order.id, status: order.status, items_count: order.order_items?.length || 0 })

        // Trigger n8n order fulfillment workflow
        try {
          if (process.env.N8N_WEBHOOK_URL) {
            await fetch(`${process.env.N8N_WEBHOOK_URL}/order-fulfillment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                orderNumber: order.order_number,
                customerEmail: order.customer_email,
                items: order.order_items,
                totalCents: order.total_cents,
              }),
            })
          }
        } catch (error) {
          console.error('n8n fulfillment failed:', error)
          // Continue anyway - order is already marked as paid
        }

        console.log('Order fulfilled:', orderId)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.order_id

        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', orderId)
        }

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        // Find order by payment intent ID
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single()

        if (order) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', order.id)
        }

        console.log('Charge refunded:', charge.id)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
