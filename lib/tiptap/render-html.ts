import { generateHTML } from "@tiptap/html";
import { getRenderExtensions } from "./extensions";

export function renderArticleBody(body: Record<string, unknown> | null | undefined): string {
  if (!body || typeof body !== "object") return "";

  try {
    return generateHTML(body, getRenderExtensions());
  } catch {
    return "";
  }
}
