'use client'

import Image from 'next/image'
import { Trash2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem as CartItemType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h4 className="font-semibold mb-1">{product.name}</h4>
        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Price and Remove */}
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(product.id)}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>

        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(product.price * quantity)}</p>
          {quantity > 1 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(product.price)} each
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
