/**
 * Schema.org Structured Data for SEO
 * Enables rich snippets in Google Search Results
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Warrior AI Automations",
    url: "https://warrior-marketplace.vercel.app",
    logo: "https://warrior-marketplace.vercel.app/logo.png",
    description:
      "Premium AI automation tools, MCP servers, and n8n workflows for rapid business growth",
    founder: {
      "@type": "Person",
      name: "Rome Guerrero",
    },
    sameAs: [
      "https://twitter.com/warrioraiautomations",
      "https://github.com/rome-guerrero9",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({ product }: { product: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: (product.price_cents / 100).toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Warrior AI Automations",
      },
    },
    aggregateRating: product.rating_avg
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating_avg.toString(),
          ratingCount: product.rating_count.toString(),
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Warrior AI Marketplace",
    url: "https://warrior-marketplace.vercel.app",
    description:
      "Premium AI automation tools, MCP servers, and n8n workflows",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://warrior-marketplace.vercel.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
