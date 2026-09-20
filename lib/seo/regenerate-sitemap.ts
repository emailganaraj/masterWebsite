import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

export function regenerateSitemapCache() {
  revalidateTag(cacheTags.sitemap);
  revalidateTag(cacheTags.homepage);
}
