"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { restoreArticleRevision } from "@/lib/actions/articles";
import { formatDateTime } from "@/lib/utils";

type Revision = {
  id: string;
  version: number;
  changeSummary: string | null;
  createdAt: Date;
};

export function RevisionsPanel({
  articleId,
  revisions,
}: {
  articleId: string;
  revisions: Revision[];
}) {
  const [pending, startTransition] = useTransition();

  const handleRestore = (revisionId: string, version: number) => {
    if (!window.confirm(`Restore version ${version}? Current content will be saved as a new revision.`)) {
      return;
    }

    startTransition(async () => {
      await restoreArticleRevision(articleId, revisionId);
      window.location.reload();
    });
  };

  if (revisions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-zinc-100">
          {revisions.map((rev) => (
            <li
              key={rev.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-zinc-900">v{rev.version}</p>
                <p className="text-zinc-500">
                  {rev.changeSummary ?? "No summary"} ·{" "}
                  {formatDateTime(rev.createdAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => handleRestore(rev.id, rev.version)}
              >
                Restore
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
