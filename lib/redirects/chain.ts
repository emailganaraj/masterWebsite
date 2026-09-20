/** Pure chain follower — prevents A→B→C redirect chains. */
export function followRedirectChain(
  edges: Record<string, string>,
  start: string,
  maxHops = 10,
): string {
  let current = start;
  const visited = new Set<string>();

  for (let i = 0; i < maxHops; i++) {
    if (visited.has(current)) break;
    visited.add(current);
    const next = edges[current];
    if (!next) break;
    current = next;
  }

  return current;
}

export function articlePath(slug: string) {
  return `/article/${slug}`;
}
