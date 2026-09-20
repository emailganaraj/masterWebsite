import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Database unreachable",
    };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      service: "master-website",
      version: process.env.npm_package_version ?? "0.1.0",
      environment: process.env.NODE_ENV ?? "development",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
      latencyMs: Date.now() - started,
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Graceful pool cleanup for standalone shutdown hooks */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
