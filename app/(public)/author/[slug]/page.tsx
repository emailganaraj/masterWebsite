import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { listArticlesByAuthor } from "@/lib/queries/articles";
import { getMediaById } from "@/lib/queries/media";
import { getAuthorBySlug } from "@/lib/queries/taxonomy";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Author not found" };

  return buildPageMetadata({
    title: author.seoTitle ?? author.name,
    description: author.seoDescription ?? author.bio,
    canonicalPath: `/author/${author.slug}`,
  });
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const [articles, avatar] = await Promise.all([
    listArticlesByAuthor(author.id),
    getMediaById(author.avatarMediaId),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: author.name },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {avatar?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar.url}
            alt={author.name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : null}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">{author.name}</h1>
          {author.bio ? (
            <p className="mt-3 max-w-2xl text-zinc-600">{author.bio}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="mb-6 text-xl font-semibold">Articles by {author.name}</h2>
        <ArticleGrid articles={articles} emptyMessage="No published articles yet." />
      </div>
    </div>
  );
}
