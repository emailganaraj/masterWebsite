"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAuthor, deleteAuthor, updateAuthor } from "@/lib/actions/authors";

type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
};

export function AuthorManager({ authors }: { authors: Author[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setBio("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = { name, slug: slug || undefined, bio };
      const result = editingId
        ? await updateAuthor(editingId, payload)
        : await createAuthor(payload);

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
          <CardTitle>{editingId ? "Edit Author" : "Add Author"}</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
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
          <CardTitle>All Authors ({authors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-zinc-100">
            {authors.map((author) => (
              <li key={author.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{author.name}</p>
                  <p className="text-xs text-zinc-500">/author/{author.slug}</p>
                  {author.bio ? (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{author.bio}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(author.id);
                      setName(author.name);
                      setSlug(author.slug);
                      setBio(author.bio ?? "");
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
                      if (!window.confirm("Delete author?")) return;
                      startTransition(async () => {
                        const result = await deleteAuthor(author.id);
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
