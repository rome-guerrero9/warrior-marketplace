import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/order/success',
          '/_next/',
          '/*.json$',
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI's crawler
        disallow: '/',
      },
      {
        userAgent: 'CCBot', // Common Crawl bot
        disallow: '/',
      },
    ],
    sitemap: 'https://warrior-marketplace.vercel.app/sitemap.xml',
  }
}
