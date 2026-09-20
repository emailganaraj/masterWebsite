import { enqueueJob, JOB_NAMES } from "@/lib/jobs/boss";
import { recordPageView } from "./record-view";
import type { PageViewJobData } from "@/lib/jobs/register-workers";

export async function enqueueOrRecordPageView(input: PageViewJobData) {
  const queued = await enqueueJob(JOB_NAMES.RECORD_PAGE_VIEW, input);
  if (queued) return { mode: "async" as const };

  await recordPageView(input);
  return { mode: "sync" as const };
}
