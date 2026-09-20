export const cacheTags = {
  homepage: "homepage",
  sitemap: "sitemap",
  article: (slug: string) => `article:${slug}`,
  category: (slug: string) => `category:${slug}`,
  tag: (slug: string) => `tag:${slug}`,
  author: (slug: string) => `author:${slug}`,
  page: (slug: string) => `page:${slug}`,
} as const;
