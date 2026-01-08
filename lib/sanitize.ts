/**
 * Input sanitization utilities for user-provided data
 *
 * These functions prevent XSS, injection attacks, and other security issues
 * by cleaning user input before it's stored in the database or sent to external APIs.
 */

/**
 * Remove potentially dangerous HTML/script tags from text
 *
 * @param text - The text to sanitize
 * @returns Sanitized text with dangerous characters escaped
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitize text for use in Stripe API calls
 *
 * Stripe has length limits and doesn't support HTML tags.
 * This function removes HTML, limits length, and ensures safe characters.
 *
 * @param text - The text to sanitize
 * @param maxLength - Maximum length (default: 500 for Stripe descriptions)
 * @returns Sanitized text safe for Stripe
 */
export function sanitizeForStripe(text: string, maxLength: number = 500): string {
  if (typeof text !== 'string') return ''

  // Remove HTML tags completely (not just escape)
  const withoutHtml = text.replace(/<[^>]*>/g, '')

  // Remove potential script injections
  const cleaned = withoutHtml
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')  // Remove event handlers like onclick=
    .replace(/data:/gi, '')   // Remove data: URLs

  // Trim to max length
  const truncated = cleaned.substring(0, maxLength).trim()

  // Replace multiple spaces with single space
  return truncated.replace(/\s+/g, ' ')
}

/**
 * Validate and sanitize email address
 *
 * @param email - Email to validate
 * @returns Sanitized email in lowercase, or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null

  // Basic email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  const trimmed = email.trim().toLowerCase()

  // Check length (max 254 chars per RFC)
  if (trimmed.length === 0 || trimmed.length > 254) return null

  // Validate format
  if (!emailRegex.test(trimmed)) return null

  return trimmed
}

/**
 * Sanitize product description for database storage
 *
 * @param description - Product description
 * @param maxLength - Maximum length (default: 5000)
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string, maxLength: number = 5000): string {
  if (typeof description !== 'string') return ''

  // Allow some basic formatting but escape dangerous characters
  const cleaned = description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')  // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')  // Remove iframes
    .replace(/javascript:/gi, '')
    .substring(0, maxLength)
    .trim()

  return cleaned
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null

  const trimmed = url.trim()

  // Check for dangerous protocols
  if (
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:') ||
    trimmed.toLowerCase().startsWith('vbscript:')
  ) {
    return null
  }

  // Must start with http:// or https:// or be protocol-relative
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('//')
  ) {
    return null
  }

  return trimmed
}

/**
 * Sanitize object by applying sanitization to all string values
 *
 * @param obj - Object to sanitize
 * @param sanitizer - Function to use for sanitization (default: sanitizeText)
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizer: (value: string) => string = sanitizeText
): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizer(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], sanitizer) as any
    }
  }

  return sanitized
}
