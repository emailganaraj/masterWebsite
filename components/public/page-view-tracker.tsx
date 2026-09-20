"use client";

import { useEffect } from "react";
import {
  READ_COOKIE_NAME,
  appendReadArticle,
  parseReadCookie,
} from "@/lib/analytics/read-cookie";

function getSessionId(): string {
  const key = "ys_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function PageViewTracker({
  articleId,
  path,
}: {
  articleId: string;
  path: string;
}) {
  useEffect(() => {
    const sessionId = getSessionId();

    const existing = parseReadCookie(
      document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${READ_COOKIE_NAME}=`))
        ?.split("=")
        .slice(1)
        .join("="),
    );
    const updated = appendReadArticle(existing, articleId);
    document.cookie = `${READ_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId,
        path,
        sessionId,
        referrer: document.referrer || null,
        device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      }),
      keepalive: true,
    }).catch(() => {
      // non-blocking
    });
  }, [articleId, path]);

  return null;
}
