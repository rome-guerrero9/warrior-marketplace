'use client'

import { useEffect } from 'react'
import { trackPurchase } from './Analytics'

interface PurchaseTrackingProps {
  orderId: string
  products: Array<{
    id: string
    name: string
    price: number
    category: string
  }>
}

export function PurchaseTracking({ orderId, products }: PurchaseTrackingProps) {
  useEffect(() => {
    // Track the completed purchase
    trackPurchase(orderId, products)

    // Also send a custom conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual conversion ID
        value: products.reduce((sum, p) => sum + p.price, 0),
        currency: 'USD',
        transaction_id: orderId,
      })
    }
  }, [orderId, products])

  return null // This component doesn't render anything
}
