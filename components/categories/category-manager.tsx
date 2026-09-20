"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setSortOrder(0);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setParentId(cat.parentId ?? "");
    setSortOrder(cat.sortOrder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        name,
        slug: slug || undefined,
        description,
        parentId: parentId || null,
        sortOrder,
      };

      const result = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Category" : "Add Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent category</Label>
              <select
                id="parent"
                className={selectClass}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None (top level)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort order</Label>
              <Input
                id="sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
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
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-zinc-100">
            {categories.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parentId);
              return (
                <li key={cat.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{cat.name}</p>
                    <p className="text-xs text-zinc-500">
                      /{cat.slug}
                      {parent ? ` · under ${parent.name}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(cat)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
