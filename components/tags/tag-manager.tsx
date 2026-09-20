"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTag, deleteTag, updateTag } from "@/lib/actions/tags";

type Tag = { id: string; name: string; slug: string; description: string | null };

export function TagManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = { name, slug: slug || undefined };
      const result = editingId
        ? await updateTag(editingId, payload)
        : await createTag(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Tag" : "Add Tag"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tags ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-zinc-100">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-xs text-zinc-500">/{tag.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(tag.id);
                      setName(tag.name);
                      setSlug(tag.slug);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm("Delete tag?")) return;
                      startTransition(async () => {
                        const result = await deleteTag(tag.id);
                        if (!result.ok) setError(result.error);
                        else router.refresh();
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
