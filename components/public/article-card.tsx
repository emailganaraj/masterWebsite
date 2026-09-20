import Image from "next/image";
import Link from "next/link";
import type { ArticleCardData } from "@/lib/queries/articles";
import { formatDateTime } from "@/lib/utils";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-zinc-100">
          {article.featuredImageUrl ? (
            <Image
              src={article.featuredImageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No image
            </div>
          )}
        </div>
        <div className="p-4">
          {article.category ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {article.category.name}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-700">
            {article.title}
          </h3>
          {article.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{article.excerpt}</p>
          ) : null}
          <p className="mt-3 text-xs text-zinc-500">
            {article.author ? `${article.author.name} · ` : ""}
            {article.publishedAt ? formatDateTime(article.publishedAt) : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
