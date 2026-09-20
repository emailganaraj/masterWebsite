"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { deleteArticle, duplicateArticle } from "@/lib/actions/articles";
import { formatDateTime } from "@/lib/utils";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date;
};

export function ArticlesTable({ articles }: { articles: ArticleRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const result = await duplicateArticle(id);
      if (result.ok && result.data?.id) {
        router.push(`/admin/articles/${result.data.id}`);
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteArticle(id);
      router.refresh();
    });
  };

  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        No articles yet.{" "}
        <Link href="/admin/articles/new" className="text-blue-600 hover:underline">
          Create your first article
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-600">Title</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600">Updated</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="font-medium text-zinc-900 hover:text-blue-600"
                >
                  {article.title}
                </Link>
                <p className="text-xs text-zinc-500">/article/{article.slug}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={article.status} />
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {formatDateTime(article.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/articles/${article.id}`}>Edit</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleDuplicate(article.id)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleDelete(article.id, article.title)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
