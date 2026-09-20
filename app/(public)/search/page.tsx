import type { Metadata } from "next";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SearchForm } from "@/components/public/search-form";
import { searchPublishedArticles } from "@/lib/queries/search";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 0;

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return buildPageMetadata({
    title: q ? `Search: ${q}` : "Search",
    description: "Search published articles.",
    canonicalPath: "/search",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? await searchPublishedArticles(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="text-3xl font-bold text-zinc-900">Search</h1>
      <div className="mt-6 max-w-lg">
        <SearchForm defaultQuery={query} />
      </div>
      <div className="mt-10">
        {query.length < 2 ? (
          <p className="text-zinc-500">Enter at least 2 characters to search.</p>
        ) : results.length === 0 ? (
          <p className="text-zinc-500">No results for &ldquo;{query}&rdquo;.</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-zinc-500">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <ArticleGrid articles={results} />
          </>
        )}
      </div>
    </div>
  );
}
