"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArticleEditor } from "@/components/editor/article-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createArticle,
  updateArticle,
  type ArticleInput,
  type ArticleStatus,
} from "@/lib/actions/articles";
import { emptyTipTapDocument } from "@/lib/tiptap/extract-text";
import { slugify } from "@/lib/utils";

type Option = { id: string; name: string };

interface ArticleFormProps {
  mode: "create" | "edit";
  articleId?: string;
  initial?: Partial<ArticleInput & { slug: string }>;
  categories: Option[];
  tags: Option[];
  authors: Option[];
  media: { id: string; filename: string; url: string }[];
}

export function ArticleForm({
  mode,
  articleId,
  initial,
  categories,
  tags,
  authors,
  media,
}: ArticleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState<Record<string, unknown>>(
    initial?.body ?? emptyTipTapDocument(),
  );
  const [status, setStatus] = useState<ArticleStatus>(
    (initial?.status as ArticleStatus) ?? "draft",
  );
  const [authorId, setAuthorId] = useState(initial?.authorId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [featuredMediaId, setFeaturedMediaId] = useState(
    initial?.featuredMediaId ?? "",
  );
  const [ogImageMediaId, setOgImageMediaId] = useState(
    initial?.ogImageMediaId ?? "",
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt
      ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
      : "",
  );
  const [changeSummary, setChangeSummary] = useState("");

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: ArticleInput = {
      title,
      slug: slug || slugify(title),
      subtitle,
      excerpt,
      body,
      status,
      authorId: authorId || null,
      categoryId: categoryId || null,
      tagIds,
      featuredMediaId: featuredMediaId || null,
      ogImageMediaId: ogImageMediaId || null,
      seoTitle,
      seoDescription,
      canonicalUrl,
      scheduledAt: status === "scheduled" && scheduledAt ? scheduledAt : null,
      changeSummary: changeSummary || undefined,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createArticle(payload)
          : await updateArticle(articleId!, payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === "create" && result.data?.id) {
        router.push(`/admin/articles/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={slugify(title) || "article-slug"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <ArticleEditor content={body} onChange={setBody} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={selectClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {status === "scheduled" ? (
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Schedule for</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              ) : null}
              {mode === "edit" ? (
                <div className="space-y-2">
                  <Label htmlFor="changeSummary">Change summary</Label>
                  <Input
                    id="changeSummary"
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="What changed in this version?"
                  />
                </div>
              ) : null}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Saving…" : mode === "create" ? "Create Article" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className={selectClass}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <select
                  id="author"
                  className={selectClass}
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                >
                  <option value="">None</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-zinc-200 p-3">
                  {tags.length === 0 ? (
                    <p className="text-xs text-zinc-500">No tags yet.</p>
                  ) : (
                    tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={tagIds.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                        />
                        {tag.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featured">Featured image</Label>
                <select
                  id="featured"
                  className={selectClass}
                  value={featuredMediaId}
                  onChange={(e) => setFeaturedMediaId(e.target.value)}
                >
                  <option value="">None</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.filename}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="og">OG image</Label>
                <select
                  id="og"
                  className={selectClass}
                  value={ogImageMediaId}
                  onChange={(e) => setOgImageMediaId(e.target.value)}
                >
                  <option value="">None</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.filename}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
