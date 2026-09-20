import { count } from "drizzle-orm";
import {
  Eye,
  FileText,
  FolderTree,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db";
import { articles, categories, users } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth/server";
import {
  getAnalyticsOverview,
  getRecentEventCount,
  getTopArticles,
} from "@/lib/queries/analytics";

export default async function AdminDashboardPage() {
  const session = await getServerSession();

  const stats = {
    totalArticles: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    categories: 0,
    users: 0,
  };

  try {
    const [articleCounts, categoryCount, userCount] = await Promise.all([
      db
        .select({
          status: articles.status,
          count: count(),
        })
        .from(articles)
        .groupBy(articles.status),
      db.select({ count: count() }).from(categories),
      db.select({ count: count() }).from(users),
    ]);

    stats.totalArticles = articleCounts.reduce((sum, r) => sum + r.count, 0);
    stats.published = articleCounts.find((r) => r.status === "published")?.count ?? 0;
    stats.drafts = articleCounts.find((r) => r.status === "draft")?.count ?? 0;
    stats.scheduled = articleCounts.find((r) => r.status === "scheduled")?.count ?? 0;
    stats.categories = categoryCount[0]?.count ?? 0;
    stats.users = userCount[0]?.count ?? 0;
  } catch {
    // Database may not be migrated yet during first boot
  }

  let analytics = { pageviews: 0, uniqueVisitors: 0, days: 7 };
  let recentEvents = 0;
  let topArticles: Awaited<ReturnType<typeof getTopArticles>> = [];

  try {
    [analytics, recentEvents, topArticles] = await Promise.all([
      getAnalyticsOverview(7),
      getRecentEventCount(24),
      getTopArticles(5),
    ]);
  } catch {
    // Analytics tables may be empty on first boot
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Signed in as {session?.user?.email ?? "admin"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Articles" value={stats.totalArticles} icon={FileText} description="All statuses" />
        <StatCard title="Published" value={stats.published} icon={Eye} description="Live on site" />
        <StatCard title="Drafts" value={stats.drafts} icon={FileText} description="In progress" />
        <StatCard title="Scheduled" value={stats.scheduled} icon={TrendingUp} description="Awaiting publish" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pageviews (7d)"
          value={analytics.pageviews.toLocaleString()}
          icon={Eye}
          description="Site traffic"
        />
        <StatCard
          title="Unique visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          icon={Users}
          description="Last 7 days"
        />
        <StatCard title="Categories" value={stats.categories} icon={FolderTree} />
        <StatCard title="Users" value={stats.users} icon={Users} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top articles</CardTitle>
            <Link href="/admin/analytics" className="text-sm text-blue-600 hover:underline">
              View analytics →
            </Link>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <p className="text-sm text-zinc-500">No views recorded yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {topArticles.map((article, i) => (
                  <li key={article.id} className="flex justify-between gap-2">
                    <span>
                      {i + 1}. {article.title}
                    </span>
                    <span className="tabular-nums text-zinc-500">
                      {article.viewsTotal.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Phase 7 — Admin Polish</CardTitle>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              Manage users →
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>✅ Users admin — roles + ban/unban (SUPER_ADMIN)</li>
              <li>✅ SEO admin — sitemap stats, regenerate, redirect list</li>
              <li>✅ All admin nav pages implemented</li>
              <li>→ Platform complete — deploy with Docker Compose</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">
              Events (24h): {recentEvents.toLocaleString()} —{" "}
              <Link href="/admin/seo" className="text-blue-600 hover:underline">SEO dashboard</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
