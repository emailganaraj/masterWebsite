import Link from "next/link";
import type { HomepageSectionData } from "@/lib/queries/homepage";
import { ArticleGrid } from "./article-grid";

export function HomepageSections({ sections }: { sections: HomepageSectionData[] }) {
  if (sections.length === 0) {
    return (
      <p className="text-center text-zinc-500">
        No homepage sections configured. Publish articles to see content here.
      </p>
    );
  }

  return (
    <div className="space-y-14">
      {sections.map((section) => {
        if (section.type === "hero" && section.articles[0]) {
          const hero = section.articles[0];
          return (
            <section key={section.id}>
              <Link
                href={`/article/${hero.slug}`}
                className="block overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white md:p-12"
              >
                {hero.category ? (
                  <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
                    {hero.category.name}
                  </p>
                ) : null}
                <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                  {hero.title}
                </h2>
                {hero.excerpt ? (
                  <p className="mt-4 max-w-2xl text-lg text-blue-100">{hero.excerpt}</p>
                ) : null}
              </Link>
            </section>
          );
        }

        return (
          <section key={section.id}>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-900">
                {section.title ?? section.type.replace(/_/g, " ")}
              </h2>
              {section.type === "latest" ? (
                <Link href="/latest" className="text-sm font-medium text-blue-600 hover:underline">
                  View all →
                </Link>
              ) : section.type === "trending" ? (
                <Link href="/trending" className="text-sm font-medium text-blue-600 hover:underline">
                  View all →
                </Link>
              ) : section.type === "popular" ? (
                <Link href="/popular" className="text-sm font-medium text-blue-600 hover:underline">
                  View all →
                </Link>
              ) : section.type === "recommended" ? (
                <Link href="/recommended" className="text-sm font-medium text-blue-600 hover:underline">
                  View all →
                </Link>
              ) : null}
            </div>
            {section.type === "hero" ? (
              <ArticleGrid articles={section.articles} />
            ) : (
              <ArticleGrid articles={section.articles} />
            )}
          </section>
        );
      })}
    </div>
  );
}
