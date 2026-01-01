'use client'

import { useEffect } from 'react'
import { trackBeginCheckout, trackViewItem } from './Analytics'

interface Product {
  id: string
  name: string
  price_cents: number
  category: string
}

interface CheckoutTrackingProps {
  product: Product
}

export function CheckoutTracking({ product }: CheckoutTrackingProps) {
  useEffect(() => {
    // Track that user viewed the product details
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price_cents / 100,
      category: product.category,
    })

    // Track that user initiated checkout
    trackBeginCheckout({
      id: product.id,
      name: product.name,
      price: product.price_cents / 100,
    })
  }, [product.id, product.name, product.price_cents, product.category])

  return null // This component doesn't render anything
}
