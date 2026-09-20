import Link from "next/link";
import { ArticlesTable } from "@/components/articles/articles-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listArticles, type ArticleStatus } from "@/lib/actions/articles";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ArticleStatus | undefined;
  const search = params.q;

  const articles = await listArticles({ status, search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        description="Create, edit, publish, and schedule articles."
        actions={
          <Button asChild>
            <Link href="/admin/articles/new">New Article</Link>
          </Button>
        }
      />

      <form className="flex flex-wrap gap-3" method="get">
        <Input
          name="q"
          placeholder="Search title or slug…"
          defaultValue={search ?? ""}
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <ArticlesTable articles={articles} />
    </div>
  );
}
