import Link from 'next/link'
import { CheckCircle2, Download, ArrowRight, Mail } from 'lucide-react'
import { SuccessTracking } from '@/app/components/SuccessTracking'

interface PageProps {
    searchParams: Promise<{ session_id?: string }>
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
    const { session_id } = await searchParams

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            {/* Analytics Tracking */}
            <SuccessTracking sessionId={session_id} />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Payment Successful! 🎉
                        </h1>
                        <p className="text-xl text-slate-400">
                            Thank you for your purchase. Your order has been confirmed.
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 text-left">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-cyan-400" />
                            What happens next?
                        </h2>

                        <div className="space-y-4">
                            <Step number={1} title="Check your email">
                                We&apos;ve sent a confirmation email with your receipt and download links.
                            </Step>
                            <Step number={2} title="Download your products">
                                Click the download button in your email to get your files.
                            </Step>
                            <Step number={3} title="Follow the setup guide">
                                Each product includes step-by-step installation instructions.
                            </Step>
                            <Step number={4} title="Get support if needed">
                                Email us at support@warrioraiautomations.com for any questions.
                            </Step>
                        </div>
                    </div>

                    {/* Session ID (for reference) */}
                    {session_id && (
                        <p className="text-sm text-slate-500 mb-8">
                            Order Reference: <code className="text-cyan-400">{session_id.slice(0, 16)}...</code>
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                        >
                            Continue Shopping
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            My Downloads
                        </Link>
                    </div>

                    {/* Trust Message */}
                    <div className="mt-12 text-slate-500 text-sm">
                        <p>Questions? Contact us at <a href="mailto:support@warrioraiautomations.com" className="text-cyan-400 hover:underline">support@warrioraiautomations.com</a></p>
                    </div>
                </div>
            </div>
        </main>
    )
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                {number}
            </div>
            <div>
                <h3 className="text-white font-medium mb-1">{title}</h3>
                <p className="text-slate-400 text-sm">{children}</p>
            </div>
        </div>
    )
}
