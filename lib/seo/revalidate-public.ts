import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

export function revalidatePublishedArticle(slug: string, categorySlug?: string | null) {
  revalidateTag(cacheTags.article(slug));
  revalidateTag(cacheTags.homepage);
  revalidateTag(cacheTags.sitemap);
  revalidateTag(cacheTags.trending);
  if (categorySlug) {
    revalidateTag(cacheTags.category(categorySlug));
  }
}

export function revalidateCategory(slug: string) {
  revalidateTag(cacheTags.category(slug));
  revalidateTag(cacheTags.homepage);
  revalidateTag(cacheTags.sitemap);
  revalidateTag(cacheTags.trending);
}

export function revalidateTagPublic(slug: string) {
  revalidateTag(cacheTags.tag(slug));
  revalidateTag(cacheTags.sitemap);
}

export function revalidateAuthor(slug: string) {
  revalidateTag(cacheTags.author(slug));
  revalidateTag(cacheTags.sitemap);
}

export function revalidateCmsPage(slug: string) {
  revalidateTag(cacheTags.page(slug));
  revalidateTag(cacheTags.sitemap);
}

export function revalidateHomepage() {
  revalidateTag(cacheTags.homepage);
}
