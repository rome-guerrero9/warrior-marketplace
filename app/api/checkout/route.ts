import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils'
import { validateEnv } from '@/lib/env'
import { getStripeClient } from '@/lib/stripe'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeEmail, sanitizeForStripe } from '@/lib/sanitize'
import type { CheckoutRequest, CheckoutItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    // Validate env vars first
    validateEnv()

    // Rate limiting: Prevent abuse by limiting requests per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimitResult = checkRateLimit(ip, {
      maxRequests: 5,    // 5 checkout attempts
      windowMs: 60000,   // per 1 minute
    })

    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

    if (!rateLimitResult.success) {
      console.warn('[Checkout] Rate limit exceeded for IP:', ip)
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a moment before trying again.',
          retryAfter: new Date(rateLimitResult.resetAt).toISOString()
        },
        {
          status: 429,
          headers: rateLimitHeaders
        }
      )
    }

    // Log for debugging
    console.log('[Checkout] Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
      hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ip,
      rateLimitRemaining: rateLimitResult.remaining,
    })

    // Get Stripe client singleton (optimized for Vercel serverless)
    const stripe = getStripeClient()
    const { items, customerEmail } = await req.json() as CheckoutRequest

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Validate and sanitize email
    const sanitizedEmail = sanitizeEmail(customerEmail)
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get Supabase admin client (bypasses RLS for order creation)
    const supabase = createAdminClient()

    // IDEMPOTENCY: Check for existing pending orders with same email and products
    const { data: existingOrders, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, stripe_session_id, created_at, order_items(*)')
      .eq('customer_email', sanitizedEmail)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
      .order('created_at', { ascending: false })
      .limit(5)

    if (existingOrders && existingOrders.length > 0) {
      // Check if any existing order has the same products
      for (const existingOrder of existingOrders) {
        const existingProductIds = existingOrder.order_items?.map((item: any) => item.product_id).sort()
        const newProductIds = items.map(item => item.productId).sort()

        if (JSON.stringify(existingProductIds) === JSON.stringify(newProductIds)) {
          console.log('[Checkout] Duplicate order detected, returning existing session')

          // If we have a Stripe session ID, try to retrieve it
          if (existingOrder.stripe_session_id) {
            try {
              const existingSession = await stripe.checkout.sessions.retrieve(existingOrder.stripe_session_id)

              // If session is still valid (not expired), return it
              if (existingSession.status === 'open' && existingSession.url) {
                return NextResponse.json(
                  {
                    sessionUrl: existingSession.url,
                    orderId: existingOrder.id,
                    isExisting: true
                  },
                  { headers: rateLimitHeaders }
                )
              }
            } catch (err) {
              console.error('[Checkout] Error retrieving existing session:', err)
              // Continue to create new session if retrieval fails
            }
          }
        }
      }
    }

    // Get product details from database
    const productIds = items.map((item) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('status', 'active')

    if (productsError || !products) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Calculate total and prepare line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let totalCents = 0

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      const quantity = item.quantity || 1
      totalCents += product.price_cents * quantity

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: sanitizeForStripe(product.name, 250), // Stripe name limit
            description: sanitizeForStripe(product.description, 500), // Stripe desc limit
            images: product.images.slice(0, 1), // Stripe allows max 8 images
          },
          unit_amount: product.price_cents,
        },
        quantity,
      })
    }

    // Create order in database
    const orderNumber = generateOrderNumber()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: sanitizedEmail,
        total_cents: totalCents,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = products.find(p => p.id === item.productId)!
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product.name,
        price_cents: product.price_cents,
        quantity: item.quantity || 1,
      }
    })

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    console.log('[Checkout] Creating Stripe checkout session...')
    let session
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        customer_email: sanitizedEmail,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
        },
      })
      console.log('[Checkout] Stripe session created successfully:', session.id)
    } catch (stripeError: any) {
      console.error('[Checkout] Stripe API error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
      })
      throw stripeError
    }

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json(
      { sessionUrl: session.url, orderId: order.id },
      { headers: rateLimitHeaders }
    )
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
