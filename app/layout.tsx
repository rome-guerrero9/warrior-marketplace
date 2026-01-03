import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { GoogleAnalytics, VercelAnalytics } from './components/Analytics'
// import { SpeedInsights } from '@vercel/speed-insights/next' // Temporarily disabled to debug

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://warrior-marketplace.vercel.app'),
  title: {
    default: 'Warrior AI Marketplace - Digital Products & AI Services',
    template: '%s | Warrior AI Marketplace'
  },
  description: 'Premium AI automation tools, MCP servers, and n8n workflows for rapid business growth. Start free or choose from Pro and Agency tiers.',
  keywords: [
    'AI automation',
    'MCP servers',
    'Claude Code',
    'Model Context Protocol',
    'n8n workflows',
    'digital products',
    'AI templates',
    'business automation',
    'AgentFlow Pro',
    'AI marketplace'
  ],
  authors: [{ name: 'Rome Guerrero', url: 'https://warrioraiautomations.com' }],
  creator: 'Warrior AI Automations',
  publisher: 'Warrior AI Automations',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://warrior-marketplace.vercel.app',
    siteName: 'Warrior AI Marketplace',
    title: 'Warrior AI Marketplace - Digital Products & AI Services',
    description: 'Premium AI automation tools, MCP servers, and n8n workflows for rapid business growth',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Warrior AI Marketplace'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Warrior AI Marketplace - Digital Products & AI Services',
    description: 'Premium AI automation tools, MCP servers, and n8n workflows',
    images: ['/og-image.png'],
    creator: '@warrioraiautomations'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <VercelAnalytics />
        {/* <SpeedInsights /> */}
      </body>
    </html>
  )
}
