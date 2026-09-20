import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, homepageSections } from "@/lib/db/schema";
import {
  listArticlesByCategory,
  listLatestArticles,
  listPopularArticles,
  listRecommendedArticles,
  listTrendingArticles,
  type ArticleCardData,
} from "./articles";

export type HomepageSectionData = {
  id: string;
  type: string;
  title: string | null;
  config: Record<string, unknown> | null;
  articles: ArticleCardData[];
};

export async function getHomepageSections(): Promise<HomepageSectionData[]> {
  const sections = await db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.enabled, true))
    .orderBy(asc(homepageSections.sortOrder));

  const result: HomepageSectionData[] = [];

  for (const section of sections) {
    let articles: ArticleCardData[] = [];
    const config = (section.config ?? {}) as Record<string, unknown>;
    const limit = Number(config.limit ?? 6);

    switch (section.type) {
      case "hero":
      case "latest":
        articles = await listLatestArticles(Math.min(limit, 1));
        break;
      case "trending":
        articles = await listTrendingArticles(limit);
        break;
      case "popular":
        articles = await listPopularArticles(limit);
        break;
      case "recommended":
        articles = await listRecommendedArticles(limit);
        break;
      case "editors_picks":
        articles = await listLatestArticles(limit);
        break;
      case "category_block": {
        const categorySlug = String(config.categorySlug ?? "");
        if (categorySlug) {
          const [cat] = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.slug, categorySlug))
            .limit(1);
          if (cat) {
            articles = await listArticlesByCategory(cat.id, limit);
          }
        }
        break;
      }
      default:
        articles = await listLatestArticles(limit);
    }

    result.push({
      id: section.id,
      type: section.type,
      title: section.title,
      config: section.config as Record<string, unknown> | null,
      articles,
    });
  }

  return result;
}
