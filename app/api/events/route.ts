import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics/record-view";
import { recomputeTrendingScores } from "@/lib/analytics/recompute-scores";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      articleId?: string;
      path?: string;
      sessionId?: string;
      referrer?: string;
      device?: string;
    };

    if (!body.path || !body.sessionId) {
      return NextResponse.json({ error: "Missing path or sessionId" }, { status: 400 });
    }

    await recordPageView({
      articleId: body.articleId,
      path: body.path,
      sessionId: body.sessionId,
      referrer: body.referrer,
      device: body.device,
    });

    // Lightweight inline recompute (full pg-boss job in Phase 5)
    if (body.articleId) {
      await recomputeTrendingScores();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
