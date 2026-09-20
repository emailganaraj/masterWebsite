import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { listArticlesByCategory } from "@/lib/queries/articles";
import { getCategoryBySlug } from "@/lib/queries/taxonomy";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  return buildPageMetadata({
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description,
    canonicalPath: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = await listArticlesByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category.name },
        ]}
      />
      <h1 className="text-3xl font-bold text-zinc-900">{category.name}</h1>
      {category.description ? (
        <p className="mt-3 max-w-2xl text-zinc-600">{category.description}</p>
      ) : null}
      <div className="mt-10">
        <ArticleGrid articles={articles} emptyMessage="No articles in this category yet." />
      </div>
    </div>
  );
}
