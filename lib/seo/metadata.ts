import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type PageSeoInput = {
  title: string;
  description?: string | null;
  canonicalPath?: string;
  ogImageUrl?: string | null;
  noindex?: boolean;
};

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const canonical = input.canonicalPath
    ? new URL(input.canonicalPath, siteUrl).toString()
    : undefined;

  return {
    title: input.title,
    description: input.description ?? undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: input.title,
      description: input.description ?? undefined,
      url: canonical,
      type: "website",
      images: input.ogImageUrl ? [{ url: input.ogImageUrl }] : undefined,
    },
    twitter: {
      card: input.ogImageUrl ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description ?? undefined,
      images: input.ogImageUrl ? [input.ogImageUrl] : undefined,
    },
  };
}

export function getSiteUrl(): string {
  return siteUrl;
}
