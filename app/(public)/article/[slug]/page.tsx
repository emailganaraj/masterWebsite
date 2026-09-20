import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/article-body";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { AdSlot } from "@/components/public/ad-slot";
import { PageViewTracker } from "@/components/public/page-view-tracker";
import { getPublishedArticleBySlug } from "@/lib/queries/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  return buildPageMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    canonicalPath: article.canonicalUrl ?? `/article/${article.slug}`,
    ogImageUrl: article.ogMedia?.ogUrl ?? article.featuredMedia?.url,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(article.category
      ? [{ label: article.category.name, href: `/category/${article.category.slug}` }]
      : []),
    { label: article.title },
  ];

  const breadcrumbSchema = breadcrumbJsonLd(
    breadcrumbs.map((b) => ({
      name: b.label,
      path: b.href ?? `/article/${article.slug}`,
    })),
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <PageViewTracker articleId={article.id} path={`/article/${article.slug}`} />
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.excerpt,
          slug: article.slug,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedContentAt ?? article.updatedAt,
          authorName: article.author?.name,
          authorSlug: article.author?.slug,
          imageUrl: article.featuredMedia?.url,
          categoryName: article.category?.name,
        })}
      />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs items={breadcrumbs} />

      <AdSlot placement="article_top" />

      {article.category ? (
        <Link
          href={`/category/${article.category.slug}`}
          className="text-sm font-semibold uppercase tracking-wide text-blue-600 hover:underline"
        >
          {article.category.name}
        </Link>
      ) : null}

      <h1 className="mt-3 text-4xl font-bold leading-tight text-zinc-900">
        {article.title}
      </h1>

      {article.subtitle ? (
        <p className="mt-3 text-xl text-zinc-600">{article.subtitle}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        {article.author ? (
          <Link href={`/author/${article.author.slug}`} className="font-medium hover:text-blue-600">
            {article.author.name}
          </Link>
        ) : null}
        {article.publishedAt ? (
          <>
            <span>·</span>
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDateTime(article.publishedAt)}
            </time>
          </>
        ) : null}
      </div>

      {article.featuredMedia?.url ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={article.featuredMedia.url}
            alt={article.featuredMedia.altText ?? article.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      ) : null}

      <div className="mt-10">
        <ArticleBody body={article.body as Record<string, unknown> | null} />
      </div>

      <AdSlot placement="article_bottom" />

      {article.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      {article.related.length > 0 ? (
        <section className="mt-16 border-t border-zinc-200 pt-10">
          <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
          <ArticleGrid articles={article.related} />
        </section>
      ) : null}
    </article>
  );
}
