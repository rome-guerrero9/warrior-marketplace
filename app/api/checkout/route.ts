import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils'
import { validateEnv } from '@/lib/env'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    validateEnv()
    const { items, customerEmail } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get Supabase admin client (bypasses RLS for order creation)
    const supabase = createAdminClient()

    // Get product details from database
    const productIds = items.map((item: any) => item.productId)
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
            name: product.name,
            description: product.description.substring(0, 500),
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
        customer_email: customerEmail,
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
    const orderItems = items.map((item: any) => {
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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customerEmail,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
    })

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ sessionUrl: session.url, orderId: order.id })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
