// Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'vendor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'vendor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'vendor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          name: string
          slug: string
          description: string
          price_cents: number
          original_price_cents: number | null
          category: string
          status: 'draft' | 'active' | 'archived'
          images: string[]
          download_url: string | null
          file_size_mb: number | null
          is_featured: boolean
          stock_count: number | null
          rating_avg: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          slug: string
          description: string
          price_cents: number
          original_price_cents?: number | null
          category: string
          status?: 'draft' | 'active' | 'archived'
          images?: string[]
          download_url?: string | null
          file_size_mb?: number | null
          is_featured?: boolean
          stock_count?: number | null
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          slug?: string
          description?: string
          price_cents?: number
          original_price_cents?: number | null
          category?: string
          status?: 'draft' | 'active' | 'archived'
          images?: string[]
          download_url?: string | null
          file_size_mb?: number | null
          is_featured?: boolean
          stock_count?: number | null
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_email: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents: number
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_email: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents: number
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents?: number
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Application Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number // In dollars
  originalPrice?: number // In dollars
  category: string
  images: string[]
  rating: number
  reviewCount: number
  isFeatured: boolean
  stockCount?: number
  downloadUrl?: string
  fileSizeMB?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  customerEmail: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  priceCents: number
  quantity: number
}

export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'customer' | 'vendor' | 'admin'
}

// Utility function to convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100
}

// Utility function to convert dollars to cents
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

// Utility function to format price
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
