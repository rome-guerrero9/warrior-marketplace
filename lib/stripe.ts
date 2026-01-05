import Stripe from 'stripe'

/**
 * Singleton Stripe client instance
 * Initialized lazily on first use to allow environment validation at runtime
 */
let stripeInstance: Stripe | null = null

/**
 * Get or create Stripe client singleton
 *
 * Configuration optimized for Vercel serverless environment:
 * - timeout: 5000ms (Vercel has 10s limit, leave buffer for DB operations)
 * - maxNetworkRetries: 2 (balance reliability vs. latency)
 * - apiVersion: '2023-10-16' (consistent across all routes)
 *
 * @throws {Error} If STRIPE_SECRET_KEY is missing or has invalid format
 * @returns {Stripe} Stripe client instance
 *
 * @example
 * ```typescript
 * import { getStripeClient } from '@/lib/stripe'
 *
 * export async function POST(req: NextRequest) {
 *   const stripe = getStripeClient()
 *   const session = await stripe.checkout.sessions.create({...})
 * }
 * ```
 */
export function getStripeClient(): Stripe {
  // Return existing instance if already created (singleton pattern)
  if (stripeInstance) {
    return stripeInstance
  }

  // Validate API key exists
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not defined. Add it to your .env.local file.\n' +
      'Get your test key from: https://dashboard.stripe.com/test/apikeys'
    )
  }

  // Validate API key format (must start with sk_test_ or sk_live_)
  if (!apiKey.startsWith('sk_test_') && !apiKey.startsWith('sk_live_')) {
    throw new Error(
      `Invalid STRIPE_SECRET_KEY format. Key must start with 'sk_test_' or 'sk_live_'.\n` +
      `Current key starts with: ${apiKey.substring(0, 10)}...`
    )
  }

  // Create and cache Stripe client instance
  stripeInstance = new Stripe(apiKey, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2,
    timeout: 5000, // 5 seconds (reduced from 30s for Vercel serverless limits)
  })

  return stripeInstance
}

/**
 * Reset the Stripe singleton instance
 *
 * Useful for testing to force re-initialization with new API keys or mock clients
 *
 * @internal Only use in test environments
 *
 * @example
 * ```typescript
 * import { resetStripeClient } from '@/lib/stripe'
 *
 * afterEach(() => {
 *   resetStripeClient()
 * })
 * ```
 */
export function resetStripeClient(): void {
  stripeInstance = null
}
