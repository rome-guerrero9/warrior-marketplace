import { createClient } from '@/lib/supabase/server'
import { centsToDollars } from '@/lib/types'
import Link from 'next/link'
import { Check, Download, ArrowRight, Zap, Shield, Code, Rocket, Users, Clock, Star } from 'lucide-react'

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

// Force dynamic rendering to fetch products on each request
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch products from Supabase
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('price_cents', { ascending: true })

  // Separate products by category (matching database category values)
  const mcpProducts = products?.filter((p: DbProduct) => p.category === 'MCP Servers') || []
  const agentflowProducts = products?.filter((p: DbProduct) => p.category === 'SaaS') || []

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'FREE'
    return `$${centsToDollars(cents)}/mo`
  }

  const getProductTier = (name: string): 'starter' | 'pro' | 'agency' => {
    if (name.toLowerCase().includes('starter') || name.toLowerCase().includes('starter pack')) return 'starter'
    if (name.toLowerCase().includes('pro pack') || name.toLowerCase().includes('professional')) return 'pro'
    return 'agency'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl" />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 text-cyan-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>No Commission Marketplace • Save 10% on Every Sale</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                Warrior AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Premium AI automation tools for developers and agencies.
              Professional MCP servers for Claude Code & intelligent workflow automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a
                href="#mcp-products"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                MCP Servers
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#agentflow-products"
                className="group px-8 py-4 bg-slate-800 border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                AgentFlow Pro
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>30-Day Money Back</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>5-Min Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Premium Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MCP Products Section */}
      <section id="mcp-products" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              <span>Developer Tools</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              MCP Server Marketplace
            </h2>
            <p className="text-slate-400 text-lg">
              Professional Model Context Protocol servers for Claude Code.
              Save hours every day with AI-powered development tools.
            </p>
          </div>

          {/* Products Grid */}
          {mcpProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {mcpProducts.map((product: DbProduct) => {
                const tier = getProductTier(product.name)
                const isFree = product.price_cents === 0
                const isPro = tier === 'pro'

                return (
                  <div
                    key={product.id}
                    className={`relative group rounded-2xl border transition-all duration-300 ${isPro
                        ? 'bg-gradient-to-b from-blue-950/80 to-slate-900/90 border-blue-500/50 shadow-xl shadow-blue-500/10 scale-105'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    {/* Popular Badge */}
                    {isPro && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {product.name.split(' - ')[0]}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {product.name.split(' - ')[1] || 'Professional MCP Servers'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-4xl font-bold ${isFree ? 'text-green-400' : 'text-white'}`}>
                            {formatPrice(product.price_cents)}
                          </span>
                          {product.original_price_cents && product.original_price_cents > product.price_cents && (
                            <span className="text-slate-500 line-through text-lg">
                              ${centsToDollars(product.original_price_cents)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features - Extract from description */}
                      <div className="space-y-3 mb-8 min-h-[160px]">
                        {tier === 'starter' && (
                          <>
                            <Feature>3 Essential MCP Servers</Feature>
                            <Feature>Project Health Auditor</Feature>
                            <Feature>Workflow Orchestrator</Feature>
                            <Feature>Domain Memory Agent</Feature>
                            <Feature>Complete Documentation</Feature>
                          </>
                        )}
                        {tier === 'pro' && (
                          <>
                            <Feature highlight>10 Professional Servers</Feature>
                            <Feature>Design to Code Converter</Feature>
                            <Feature>API Debugger</Feature>
                            <Feature>Priority Email Support</Feature>
                            <Feature>Private Discord Access</Feature>
                          </>
                        )}
                        {tier === 'agency' && (
                          <>
                            <Feature highlight>Unlimited Servers</Feature>
                            <Feature highlight>Kali Security Suite</Feature>
                            <Feature>Team Collaboration (5 users)</Feature>
                            <Feature>White-Label Options</Feature>
                            <Feature>Private Slack Channel</Feature>
                          </>
                        )}
                      </div>

                      {/* CTA Button */}
                      {isFree && product.download_url ? (
                        <a
                          href={product.download_url}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download Free
                        </a>
                      ) : (
                        <Link
                          href={`/checkout/${product.slug}`}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${isPro
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                            }`}
                        >
                          {isFree ? 'Get Started Free' : 'Subscribe Now'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* AgentFlow Products Section */}
      <section id="agentflow-products" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-purple-400 text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              <span>SaaS & Automation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AgentFlow Pro
            </h2>
            <p className="text-slate-400 text-lg">
              AI-powered agency management platform. Transform your workflow with
              intelligent automation and white-label client portals.
            </p>
          </div>

          {/* Products Grid */}
          {agentflowProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {agentflowProducts.map((product: DbProduct) => {
                const tier = getProductTier(product.name)
                const isPro = tier === 'pro'

                return (
                  <div
                    key={product.id}
                    className={`relative group rounded-2xl border transition-all duration-300 ${isPro
                        ? 'bg-gradient-to-b from-purple-950/80 to-slate-900/90 border-purple-500/50 shadow-xl shadow-purple-500/10 scale-105'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    {/* Best Value Badge */}
                    {isPro && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          BEST VALUE
                        </span>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {product.name.replace('AgentFlow Pro - ', '')}
                        </h3>
                        {tier === 'starter' && <p className="text-sm text-slate-400">For solo operators</p>}
                        {tier === 'pro' && <p className="text-sm text-slate-400">For growing teams</p>}
                        {tier === 'agency' && <p className="text-sm text-slate-400">For enterprises</p>}
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            {formatPrice(product.price_cents)}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8 min-h-[160px]">
                        {tier === 'starter' && (
                          <>
                            <Feature>5 Active Clients</Feature>
                            <Feature>10 Projects</Feature>
                            <Feature>White-label Portal</Feature>
                            <Feature>Basic Automation</Feature>
                            <Feature>Email Support</Feature>
                          </>
                        )}
                        {tier === 'pro' && (
                          <>
                            <Feature highlight>25 Active Clients</Feature>
                            <Feature highlight>Unlimited Projects</Feature>
                            <Feature>Advanced Automation</Feature>
                            <Feature>API Access</Feature>
                            <Feature>Team Collaboration (3 users)</Feature>
                          </>
                        )}
                        {tier === 'agency' && (
                          <>
                            <Feature highlight>Unlimited Clients</Feature>
                            <Feature highlight>Dedicated Success Manager</Feature>
                            <Feature>Custom AI Integrations</Feature>
                            <Feature>99.9% Uptime SLA</Feature>
                            <Feature>24/7 Priority Support</Feature>
                          </>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/checkout/${product.slug}`}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${isPro
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                          }`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Sell on Warrior AI Marketplace?
              </h2>
              <p className="text-slate-400">
                Keep more of your revenue with our zero-commission platform
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="py-4 px-2 text-slate-400 font-medium">Platform</th>
                    <th className="py-4 px-2 text-slate-400 font-medium text-center">Commission</th>
                    <th className="py-4 px-2 text-slate-400 font-medium text-center">Stripe Fees</th>
                    <th className="py-4 px-2 text-slate-400 font-medium text-center">You Keep</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-2 text-slate-300">Gumroad</td>
                    <td className="py-4 px-2 text-center text-red-400">10%</td>
                    <td className="py-4 px-2 text-center text-slate-400">2.9%</td>
                    <td className="py-4 px-2 text-center text-slate-300">$8,710</td>
                  </tr>
                  <tr className="bg-green-500/5">
                    <td className="py-4 px-2 text-white font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Warrior AI Marketplace
                    </td>
                    <td className="py-4 px-2 text-center text-green-400 font-bold">0%</td>
                    <td className="py-4 px-2 text-center text-slate-400">2.9%</td>
                    <td className="py-4 px-2 text-center text-green-400 font-bold">$9,710</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <p className="text-2xl font-bold text-white">
                Save <span className="text-green-400">$12,000/year</span> at $10K/mo revenue
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-4">
            Ready to launch? 🚀 Follow the setup guide and you'll have a fully functional marketplace in 30-45 minutes.
          </p>
          <p className="text-slate-600 text-xs">
            <strong>Rome Guerrero</strong> | Warrior AI Automations • Your marketplace, your rules, your revenue.
          </p>
        </div>
      </section>
    </main>
  )
}

// Feature component
function Feature({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Check className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-cyan-400' : 'text-green-500'}`} />
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-slate-300'}`}>
        {children}
      </span>
    </div>
  )
}
