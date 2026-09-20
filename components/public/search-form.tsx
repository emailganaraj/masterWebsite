"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles…"
        className="h-9 w-40 rounded-md border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-52"
        minLength={2}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
