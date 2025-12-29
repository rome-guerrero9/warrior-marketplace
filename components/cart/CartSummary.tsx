'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CartSummaryProps {
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
  onCheckout: () => void
  isCheckingOut?: boolean
}

export function CartSummary({
  subtotal,
  tax = 0,
  shipping = 0,
  discount = 0,
  onCheckout,
  isCheckingOut = false,
}: CartSummaryProps) {
  const total = subtotal + tax + shipping - discount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
        )}

        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{formatCurrency(shipping)}</span>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onCheckout}
          className="w-full"
          size="lg"
          disabled={isCheckingOut || subtotal === 0}
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </CardFooter>
    </Card>
  )
}
