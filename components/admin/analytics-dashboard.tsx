import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  BreakdownRow,
  TopArticle,
  TrafficDay,
} from "@/lib/queries/analytics";
import { Eye, TrendingUp, Users } from "lucide-react";

type Props = {
  overview: {
    pageviews: number;
    uniqueVisitors: number;
    totalArticleViews: number;
    days: number;
  };
  traffic: TrafficDay[];
  topArticles: TopArticle[];
  referrers: BreakdownRow[];
  devices: BreakdownRow[];
  recentEvents: number;
};

function BarChart({ data }: { data: TrafficDay[] }) {
  const max = Math.max(...data.map((d) => d.pageviews), 1);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((day) => (
        <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-blue-500"
            style={{ height: `${Math.max((day.pageviews / max) * 100, 2)}%` }}
            title={`${day.date}: ${day.pageviews} views`}
          />
          <span className="text-[10px] text-zinc-400">{day.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function BreakdownTable({ rows, labelHeader }: { rows: BreakdownRow[]; labelHeader: string }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-zinc-500">
          <th className="pb-2 font-medium">{labelHeader}</th>
          <th className="pb-2 text-right font-medium">Views</th>
          <th className="pb-2 text-right font-medium">%</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-4 text-zinc-400">No data yet</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.label} className="border-b border-zinc-100">
              <td className="max-w-[200px] truncate py-2">{row.label}</td>
              <td className="py-2 text-right tabular-nums">{row.value.toLocaleString()}</td>
              <td className="py-2 text-right tabular-nums text-zinc-500">
                {Math.round((row.value / total) * 100)}%
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function AnalyticsDashboard({
  overview,
  traffic,
  topArticles,
  referrers,
  devices,
  recentEvents,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={`Pageviews (${overview.days}d)`}
          value={overview.pageviews.toLocaleString()}
          icon={Eye}
          description="Raw events in period"
        />
        <StatCard
          title="Unique visitors"
          value={overview.uniqueVisitors.toLocaleString()}
          icon={Users}
          description={`Last ${overview.days} days`}
        />
        <StatCard
          title="Total article views"
          value={overview.totalArticleViews.toLocaleString()}
          icon={TrendingUp}
          description="All-time article_stats"
        />
        <StatCard
          title="Events (24h)"
          value={recentEvents.toLocaleString()}
          icon={Eye}
          description="Recent activity"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic — last {traffic.length} days</CardTitle>
        </CardHeader>
        <CardContent>
          {traffic.length > 0 ? (
            <BarChart data={traffic} />
          ) : (
            <p className="text-sm text-zinc-500">No traffic data yet. Views appear after articles are read.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top articles</CardTitle>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <p className="text-sm text-zinc-500">No article views recorded yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {topArticles.map((article, i) => (
                  <li key={article.id} className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">{i + 1}.</span>
                    <Link
                      href={`/article/${article.slug}`}
                      className="flex-1 truncate hover:text-blue-600"
                      target="_blank"
                    >
                      {article.title}
                    </Link>
                    <span className="tabular-nums text-zinc-600">
                      {article.viewsTotal.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={referrers} labelHeader="Referrer" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={devices} labelHeader="Device" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>✅ POST /api/events — async queue with sync fallback</li>
              <li>✅ pg-boss worker — trending, rollups, scheduled publish</li>
              <li>→ AdSense OAuth revenue sync (Phase 5 scaffold)</li>
              <li>→ Run worker: <code className="rounded bg-zinc-100 px-1">pnpm run worker</code></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
