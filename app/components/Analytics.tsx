'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Google Analytics 4 Implementation
 * Tracks page views and conversion events
 */

// Get GA ID from environment (will be set in production)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()

    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

/**
 * Conversion Tracking Functions
 * Call these on important user actions
 */

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, eventParams)
  }
}

// Specific conversion events
export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  category: string
}) => {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1,
      },
    ],
  })
}

export const trackBeginCheckout = (product: {
  id: string
  name: string
  price: number
}) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
      },
    ],
  })
}

export const trackPurchase = (
  orderId: string,
  products: Array<{
    id: string
    name: string
    price: number
    category: string
  }>
) => {
  const totalValue = products.reduce((sum, p) => sum + p.price, 0)

  trackEvent('purchase', {
    transaction_id: orderId,
    value: totalValue,
    currency: 'USD',
    items: products.map((p) => ({
      item_id: p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      quantity: 1,
    })),
  })
}

export const trackViewItem = (product: {
  id: string
  name: string
  price: number
  category: string
}) => {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  })
}

/**
 * Vercel Analytics
 * Automatically tracks Core Web Vitals
 */
export function VercelAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <Script
      src="https://va.vercel-scripts.com/v1/script.js"
      strategy="afterInteractive"
      data-mode="auto"
    />
  )
}
