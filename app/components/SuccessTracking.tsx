'use client'

import { useEffect } from 'react'

interface SuccessTrackingProps {
  sessionId?: string
}

export function SuccessTracking({ sessionId }: SuccessTrackingProps) {
  useEffect(() => {
    // Track purchase completion page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Track custom event for reaching success page
      ;(window as any).gtag('event', 'purchase_complete', {
        session_id: sessionId,
        page_location: window.location.href,
      })

      // Track as a conversion (generic)
      ;(window as any).gtag('event', 'conversion', {
        send_to: 'purchase_conversion',
        value: 1.0,
        currency: 'USD',
      })
    }
  }, [sessionId])

  return null // This component doesn't render anything
}
