/**
 * Simple in-memory rate limiter for API routes
 *
 * This prevents abuse by limiting requests per IP address.
 * For production with multiple serverless instances, consider Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Store rate limit data in memory (per serverless instance)
const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   * @default 5
   */
  maxRequests?: number

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the requester (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 *
 * @example
 * ```typescript
 * const ip = req.headers.get('x-forwarded-for') || 'unknown'
 * const result = checkRateLimit(ip, { maxRequests: 5, windowMs: 60000 })
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests', retryAfter: result.resetAt },
 *     { status: 429 }
 *   )
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { maxRequests = 5, windowMs = 60000 } = config
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitMap.get(identifier)

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs
    }
    rateLimitMap.set(identifier, entry)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt
    }
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: entry.resetAt
    }
  }

  // Increment count
  entry.count++
  rateLimitMap.set(identifier, entry)

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Get rate limit headers for HTTP responses
 *
 * @param result - Rate limit result from checkRateLimit
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  }
}
