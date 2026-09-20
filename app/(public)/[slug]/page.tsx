import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/article-body";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getPublishedPageBySlug } from "@/lib/queries/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

const LEGAL_SLUGS = new Set(["about", "contact", "privacy", "terms", "disclaimer"]);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "Page not found" };

  return buildPageMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription,
    canonicalPath: `/${page.slug}`,
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (!LEGAL_SLUGS.has(slug)) notFound();

  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <h1 className="text-3xl font-bold text-zinc-900">{page.title}</h1>
      <div className="mt-8">
        <ArticleBody body={page.body as Record<string, unknown> | null} />
      </div>
    </div>
  );
}
