import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateEnv } from '@/lib/env'

export async function GET() {
  try {
    // Validate env vars
    validateEnv()

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      env_check: {
        has_stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
        key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'MISSING',
        key_length: process.env.STRIPE_SECRET_KEY?.length || 0,
        is_test_key: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false,
        is_live_key: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false,
      },
      stripe_init: {
        api_version: '2023-10-16',
        max_retries: 2,
        timeout: 30000,
      },
    }

    // Try to initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      maxNetworkRetries: 2,
      timeout: 30000,
    })

    diagnostics.stripe_client_created = true

    // Try a simple API call to verify connection
    try {
      const balance = await stripe.balance.retrieve()
      diagnostics.stripe_api_test = {
        success: true,
        balance_available: balance.available.map(b => ({ amount: b.amount, currency: b.currency })),
        livemode: balance.livemode,
      }
    } catch (apiError: any) {
      diagnostics.stripe_api_test = {
        success: false,
        error_type: apiError.type,
        error_code: apiError.code,
        error_message: apiError.message,
        status_code: apiError.statusCode,
      }
    }

    return NextResponse.json(diagnostics)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
