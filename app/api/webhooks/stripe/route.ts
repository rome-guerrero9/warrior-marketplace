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
    // DEDUPLICATION: Check if this event has already been processed
    const { data: existingEvent, error: checkError } = await supabase
      .from('stripe_events')
      .select('event_id')
      .eq('event_id', event.id)
      .single()

    if (existingEvent) {
      console.log('[Webhook] Event already processed:', event.id)
      return NextResponse.json({ received: true, already_processed: true })
    }

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means "not found", which is expected for new events
      console.error('[Webhook] Error checking event deduplication:', checkError)
      return NextResponse.json(
        { error: 'Failed to verify event deduplication' },
        { status: 500 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        console.log('[Webhook] checkout.session.completed received')
        console.log('[Webhook] Session metadata:', session.metadata)
        console.log('[Webhook] Order ID from metadata:', orderId)

        if (!orderId) {
          console.error('[Webhook] CRITICAL: No order_id in session metadata', {
            sessionId: session.id,
            customerEmail: session.customer_email,
            amount: session.amount_total
          })

          // Record the event even if it failed to prevent retries
          await supabase.from('stripe_events').insert({
            event_id: event.id,
            event_type: event.type,
            order_id: null,
            metadata: {
              error: 'missing_order_id',
              session_id: session.id
            }
          })

          return NextResponse.json(
            { error: 'Missing order_id in session metadata' },
            { status: 400 }
          )
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
          console.error('[Webhook] CRITICAL: Error updating order:', updateError, {
            orderId,
            sessionId: session.id
          })

          // Record the failed event
          await supabase.from('stripe_events').insert({
            event_id: event.id,
            event_type: event.type,
            order_id: orderId,
            metadata: {
              error: 'order_update_failed',
              error_details: updateError.message
            }
          })

          return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
          )
        }

        console.log('[Webhook] Order update result:', updateData)

        // Get order details for fulfillment
        console.log('[Webhook] Fetching order for fulfillment...')
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single()

        if (fetchError || !order) {
          console.error('[Webhook] CRITICAL: Error fetching order:', fetchError || 'Order not found', {
            orderId,
            sessionId: session.id
          })

          // Still record the event as processed (order was updated to paid)
          await supabase.from('stripe_events').insert({
            event_id: event.id,
            event_type: event.type,
            order_id: orderId,
            metadata: {
              warning: 'order_fetch_failed_after_update',
              session_id: session.id
            }
          })

          // Return success since order was marked as paid
          return NextResponse.json({ received: true, warning: 'Order updated but fetch failed' })
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

        // Record this event as processed
        await supabase.from('stripe_events').insert({
          event_id: event.id,
          event_type: event.type,
          order_id: orderId,
          metadata: {
            session_id: session.id,
            customer_email: order.customer_email
          }
        })

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

        // Record this event as processed
        await supabase.from('stripe_events').insert({
          event_id: event.id,
          event_type: event.type,
          order_id: orderId || null,
          metadata: {
            payment_intent_id: paymentIntent.id
          }
        })

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

        // Record this event as processed
        await supabase.from('stripe_events').insert({
          event_id: event.id,
          event_type: event.type,
          order_id: order?.id || null,
          metadata: {
            charge_id: charge.id,
            payment_intent_id: paymentIntentId
          }
        })

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
