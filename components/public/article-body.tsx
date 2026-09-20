import { renderArticleBody } from "@/lib/tiptap/render-html";

export function ArticleBody({ body }: { body: Record<string, unknown> | null }) {
  const html = renderArticleBody(body ?? undefined);

  return (
    <div
      className="prose prose-zinc max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
