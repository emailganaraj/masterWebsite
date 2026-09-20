"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMedia, uploadMedia, type MediaListItem } from "@/lib/actions/media";

export function MediaLibrary({
  items,
  storageMode,
}: {
  items: MediaListItem[];
  storageMode: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altText", altText);

    startTransition(async () => {
      const result = await uploadMedia(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAltText("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  };

  const copyUrl = async (item: MediaListItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-500">
            Storage: <strong>{storageMode}</strong> · Sharp generates thumb, medium, large, and OG variants.
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file">Image file</Label>
              <Input id="file" type="file" accept="image/*" ref={fileRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt text</Label>
              <Input
                id="alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
          </div>
          <Button type="button" onClick={handleUpload} disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Library ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">No media uploaded yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-video bg-zinc-100">
                    <Image
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium">{item.filename}</p>
                    <p className="text-xs text-zinc-500">
                      {item.width}×{item.height}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyUrl(item)}
                      >
                        {copiedId === item.id ? "Copied!" : "Copy URL"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("Delete this media?")) return;
                          startTransition(async () => {
                            const result = await deleteMedia(item.id);
                            if (!result.ok) setError(result.error);
                            else router.refresh();
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
