import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { countPublishedArticlesByTag, listArticlesByTag } from "@/lib/queries/articles";
import { getTagBySlug } from "@/lib/queries/taxonomy";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag not found" };

  const count = await countPublishedArticlesByTag(tag.id);

  return buildPageMetadata({
    title: `#${tag.name}`,
    description: tag.description ?? `Articles tagged ${tag.name}`,
    canonicalPath: `/tag/${tag.slug}`,
    noindex: count < 3,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const articles = await listArticlesByTag(tag.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `#${tag.name}` },
        ]}
      />
      <h1 className="text-3xl font-bold text-zinc-900">#{tag.name}</h1>
      {tag.description ? (
        <p className="mt-3 max-w-2xl text-zinc-600">{tag.description}</p>
      ) : null}
      <div className="mt-10">
        <ArticleGrid articles={articles} emptyMessage="No articles with this tag yet." />
      </div>
    </div>
  );
}
