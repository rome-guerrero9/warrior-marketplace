import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Shield, CreditCard, Download } from 'lucide-react'
import { centsToDollars } from '@/lib/types'

interface PageProps {
    params: Promise<{ slug: string }>
}

interface DbProduct {
    id: string
    name: string
    slug: string
    description: string
    price_cents: number
    original_price_cents: number | null
    category: string
    is_featured: boolean
    download_url: string | null
}

export default async function CheckoutPage({ params }: PageProps) {
    const { slug } = await params

    const supabase = await createClient()
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

    if (error || !product) {
        notFound()
    }

    const isFree = product.price_cents === 0
    const hasDiscount = product.original_price_cents && product.original_price_cents > product.price_cents
    const discountPercent = hasDiscount
        ? Math.round(((product.original_price_cents - product.price_cents) / product.original_price_cents) * 100)
        : 0

    // For free products with download URL, redirect to download
    if (isFree && product.download_url) {
        redirect(product.download_url)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="container mx-auto px-4 py-12">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8">
                        {/* Product Info - Left */}
                        <div className="md:col-span-3">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                                <div className="mb-6">
                                    <span className="text-sm text-cyan-400 font-medium uppercase tracking-wide">
                                        {product.category}
                                    </span>
                                    <h1 className="text-3xl font-bold text-white mt-2 mb-4">
                                        {product.name}
                                    </h1>
                                    <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 pt-6 border-t border-slate-800">
                                    <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
                                    {product.category === 'MCP Servers' ? (
                                        <>
                                            <Feature>Instant download after purchase</Feature>
                                            <Feature>Complete documentation</Feature>
                                            <Feature>One-click installation script</Feature>
                                            <Feature>Priority email support</Feature>
                                            <Feature>Free updates for 12 months</Feature>
                                        </>
                                    ) : (
                                        <>
                                            <Feature>Full platform access</Feature>
                                            <Feature>White-label client portal</Feature>
                                            <Feature>24/7 priority support</Feature>
                                            <Feature>Regular feature updates</Feature>
                                            <Feature>Cancel anytime</Feature>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Checkout Form - Right */}
                        <div className="md:col-span-2">
                            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                                {/* Price Display */}
                                <div className="flex items-baseline gap-3 mb-6">
                                    {isFree ? (
                                        <span className="text-4xl font-bold text-green-400">FREE</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold text-white">
                                                ${centsToDollars(product.price_cents)}
                                            </span>
                                            <span className="text-slate-400">/month</span>
                                        </>
                                    )}
                                    {hasDiscount && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg text-slate-500 line-through">
                                                ${centsToDollars(product.original_price_cents)}
                                            </span>
                                            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                                                SAVE {discountPercent}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Checkout Form */}
                                <form action="/api/checkout" method="POST" className="space-y-4">
                                    <input type="hidden" name="productId" value={product.id} />

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        />
                                    </div>

                                    {isFree ? (
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Free
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            Continue to Payment
                                        </button>
                                    )}
                                </form>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span>30-day money-back guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        <span>Secure payment via Stripe</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Download className="w-4 h-4 text-cyan-500" />
                                        <span>Instant access after purchase</span>
                                    </div>
                                </div>

                                {/* Stripe Badge */}
                                <div className="mt-6 text-center">
                                    <span className="text-xs text-slate-500">
                                        Payments secured by <span className="text-slate-400 font-semibold">Stripe</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function Feature({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-300 text-sm">{children}</span>
        </div>
    )
}
