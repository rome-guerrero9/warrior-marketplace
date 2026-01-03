import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test 1: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasUrl || !hasAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        envVars: {
          hasUrl,
          hasAnonKey,
        }
      }, { status: 500 })
    }

    // Test 2: Try to fetch products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, category, status')
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        envVars: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...',
        }
      }, { status: 500 })
    }

    // Success!
    return NextResponse.json({
      success: true,
      productsCount: products?.length || 0,
      products: products?.map(p => ({ name: p.name, slug: p.slug, category: p.category })),
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
