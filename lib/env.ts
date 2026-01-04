const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
]

export function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Validate Stripe key mode matching
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  const secretKey = process.env.STRIPE_SECRET_KEY!

  const isPublishableTest = publishableKey.startsWith('pk_test_')
  const isPublishableLive = publishableKey.startsWith('pk_live_')
  const isSecretTest = secretKey.startsWith('sk_test_')
  const isSecretLive = secretKey.startsWith('sk_live_') || secretKey.startsWith('sk_org_live_')

  if (isPublishableTest && !isSecretTest) {
    throw new Error(
      `Stripe key mode mismatch: You're using a TEST publishable key (pk_test_...) ` +
      `with a LIVE secret key (${secretKey.substring(0, 15)}...). ` +
      `Both keys must be either TEST or LIVE mode.`
    )
  }

  if (isPublishableLive && !isSecretLive) {
    throw new Error(
      `Stripe key mode mismatch: You're using a LIVE publishable key (pk_live_...) ` +
      `with a TEST secret key (${secretKey.substring(0, 15)}...). ` +
      `Both keys must be either TEST or LIVE mode.`
    )
  }
}
