import { ArticleForm } from "@/components/articles/article-form";
import { PageHeader } from "@/components/admin/page-header";
import { listAuthors } from "@/lib/actions/authors";
import { listCategories } from "@/lib/actions/categories";
import { listMedia } from "@/lib/actions/media";
import { listTags } from "@/lib/actions/tags";

export default async function NewArticlePage() {
  const [categories, tags, authors, media] = await Promise.all([
    listCategories(),
    listTags(),
    listAuthors(),
    listMedia(100),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Article"
        description="Write content with the TipTap editor and configure SEO."
      />
      <ArticleForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        authors={authors.map((a) => ({ id: a.id, name: a.name }))}
        media={media.map((m) => ({ id: m.id, filename: m.filename, url: m.url }))}
      />
    </div>
  );
}
