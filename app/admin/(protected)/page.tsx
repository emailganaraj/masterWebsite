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
import { db } from "@/lib/db";
import { articles, categories, users } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth/server";

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

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Categories" value={stats.categories} icon={FolderTree} />
        <StatCard title="Users" value={stats.users} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1 Complete Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>✅ Next.js 15 + TypeScript + Tailwind scaffold</li>
            <li>✅ PostgreSQL schema (Drizzle ORM)</li>
            <li>✅ Better Auth + RBAC roles</li>
            <li>✅ Admin layout shell + navigation</li>
            <li>✅ Health check endpoint (/api/health)</li>
            <li>✅ Docker Compose (app + postgres + nginx)</li>
            <li>→ Phase 2: TipTap editor + article CRUD</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
