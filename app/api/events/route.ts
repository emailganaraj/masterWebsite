import { NextRequest, NextResponse } from "next/server";
import { enqueueOrRecordPageView } from "@/lib/analytics/enqueue-page-view";

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

    const country = request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country");

    const result = await enqueueOrRecordPageView({
      articleId: body.articleId,
      path: body.path,
      sessionId: body.sessionId,
      referrer: body.referrer,
      device: body.device,
      country,
    });

    if (result.mode === "async") {
      return NextResponse.json({ ok: true, queued: true }, { status: 202 });
    }

    return NextResponse.json({ ok: true, queued: false });
  } catch {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
