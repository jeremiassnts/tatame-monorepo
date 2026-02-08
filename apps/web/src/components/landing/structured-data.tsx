/**
 * JSON-LD structured data for SEO (§9.3.2).
 * SoftwareApplication with name, category, and price offer.
 */

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tatame",
    applicationCategory: "BusinessApplication",
    operatingSystem: "iOS, Android",
    offers: {
      "@type": "Offer",
      price: "49.99",
      priceCurrency: "BRL",
      priceValidUntil: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      )
        .toISOString()
        .slice(0, 10),
      category: "Subscription",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
