"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteRedirect, regenerateSitemap } from "@/lib/actions/seo";
import { FileText, Link2, Map, RefreshCw } from "lucide-react";

type Props = {
  overview: {
    siteUrl: string;
    sitemapUrl: string;
    robotsUrl: string;
    settings: {
      siteName: string;
      defaultSeoTitle: string;
      defaultSeoDescription: string;
    };
    counts: {
      articles: number;
      categories: number;
      tags: number;
      authors: number;
      pages: number;
      redirects: number;
      sitemapEntries: number;
    };
    redirects: {
      id: string;
      fromPath: string;
      toPath: string;
      statusCode: number;
      createdAt: Date;
    }[];
  };
};

export function SeoDashboard({ overview }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const runRegenerate = () => {
    startTransition(async () => {
      await regenerateSitemap();
      router.refresh();
    });
  };

  const runDeleteRedirect = (id: string) => {
    startTransition(async () => {
      await deleteRedirect(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Sitemap entries"
          value={overview.counts.sitemapEntries}
          icon={Map}
          description="Approx. URLs in sitemap"
        />
        <StatCard
          title="Published articles"
          value={overview.counts.articles}
          icon={FileText}
        />
        <StatCard
          title="301 redirects"
          value={overview.counts.redirects}
          icon={Link2}
        />
        <StatCard
          title="CMS pages"
          value={overview.counts.pages}
          icon={FileText}
          description="Legal / about pages"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Default SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Site:</span>{" "}
              {overview.settings.siteName}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Title:</span>{" "}
              {overview.settings.defaultSeoTitle}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Description:</span>{" "}
              {overview.settings.defaultSeoDescription}
            </p>
            <Link href="/admin/settings" className="inline-block text-blue-600 hover:underline">
              Edit in Settings →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sitemap & robots</CardTitle>
            <Button size="sm" disabled={pending} onClick={runRegenerate}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <Link href={overview.sitemapUrl} target="_blank" className="text-blue-600 hover:underline">
                {overview.sitemapUrl}
              </Link>
            </p>
            <p>
              <Link href={overview.robotsUrl} target="_blank" className="text-blue-600 hover:underline">
                {overview.robotsUrl}
              </Link>
            </p>
            <p className="text-zinc-500">
              Sitemap revalidates hourly (ISR). Use Regenerate after bulk publishes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>301 redirects ({overview.redirects.length} shown)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {overview.redirects.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No redirects yet. They are created automatically when a published article slug changes.
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-2 pr-4 font-medium">From</th>
                  <th className="pb-2 pr-4 font-medium">To</th>
                  <th className="pb-2 pr-4 font-medium">Code</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {overview.redirects.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100">
                    <td className="py-2 pr-4 font-mono text-xs">{row.fromPath}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.toPath}</td>
                    <td className="py-2 pr-4">{row.statusCode}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => runDeleteRedirect(row.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
