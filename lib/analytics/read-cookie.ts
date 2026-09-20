export const READ_COOKIE_NAME = "ys_read";
export const READ_COOKIE_MAX = 50;

export function parseReadCookie(value: string | undefined | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string").slice(0, READ_COOKIE_MAX);
  } catch {
    return [];
  }
}

export function appendReadArticle(existing: string[], articleId: string): string[] {
  const next = [articleId, ...existing.filter((id) => id !== articleId)];
  return next.slice(0, READ_COOKIE_MAX);
}
