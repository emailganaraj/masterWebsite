import { getSiteUrl } from "./metadata";

export function articleJsonLd(input: {
  title: string;
  description?: string | null;
  slug: string;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
  authorSlug?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/article/${input.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description ?? undefined,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt)?.toISOString(),
    mainEntityOfPage: url,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    author: input.authorName
      ? {
          "@type": "Person",
          name: input.authorName,
          url: input.authorSlug ? `${siteUrl}/author/${input.authorSlug}` : undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SITE_NAME ?? "My Article Website",
      url: siteUrl,
    },
    articleSection: input.categoryName ?? undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function websiteJsonLd(siteName: string, description: string) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description,
    url: siteUrl,
  };
}
