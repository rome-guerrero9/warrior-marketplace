import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://warrior-marketplace.vercel.app'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]

  // Product pages
  const products = [
    'mcp-starter-pack',
    'mcp-pro-pack',
    'mcp-agency-suite',
    'agentflow-starter',
    'agentflow-professional',
    'agentflow-agency',
  ]

  const productPages = products.map((slug) => ({
    url: `${baseUrl}/checkout/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...productPages]
}
