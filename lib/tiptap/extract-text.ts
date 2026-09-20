type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
};

/** Extract plain text from TipTap ProseMirror JSON for search indexing. */
export function extractTextFromBody(body: Record<string, unknown> | null | undefined): string {
  if (!body) return "";

  const parts: string[] = [];

  function walk(node: TipTapNode) {
    if (node.text) parts.push(node.text);
    if (node.content) {
      for (const child of node.content) walk(child);
    }
  }

  walk(body as TipTapNode);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function emptyTipTapDocument(): Record<string, unknown> {
  return { type: "doc", content: [{ type: "paragraph" }] };
}
