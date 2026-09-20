import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/articles/article-form";
import { RevisionsPanel } from "@/components/articles/revisions-panel";
import { PageHeader } from "@/components/admin/page-header";
import {
  getArticleById,
  listArticleRevisions,
} from "@/lib/actions/articles";
import { listAuthors } from "@/lib/actions/authors";
import { listCategories } from "@/lib/actions/categories";
import { listMedia } from "@/lib/actions/media";
import { listTags } from "@/lib/actions/tags";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories, tags, authors, media, revisions] =
    await Promise.all([
      getArticleById(id),
      listCategories(),
      listTags(),
      listAuthors(),
      listMedia(100),
      listArticleRevisions(id),
    ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Article"
        description={`/${article.slug} · ${article.status}`}
      />
      <ArticleForm
        mode="edit"
        articleId={id}
        initial={{
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle ?? undefined,
          excerpt: article.excerpt ?? undefined,
          body: (article.body as Record<string, unknown>) ?? undefined,
          status: article.status,
          authorId: article.authorId ?? undefined,
          categoryId: article.categoryId ?? undefined,
          tagIds: article.tagIds,
          featuredMediaId: article.featuredMediaId ?? undefined,
          ogImageMediaId: article.ogImageMediaId ?? undefined,
          seoTitle: article.seoTitle ?? undefined,
          seoDescription: article.seoDescription ?? undefined,
          canonicalUrl: article.canonicalUrl ?? undefined,
          scheduledAt: article.scheduledAt?.toISOString(),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        authors={authors.map((a) => ({ id: a.id, name: a.name }))}
        media={media.map((m) => ({ id: m.id, filename: m.filename, url: m.url }))}
      />
      <RevisionsPanel articleId={id} revisions={revisions} />
    </div>
  );
}
