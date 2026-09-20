import { Badge } from "@/components/ui/badge";

const variantMap = {
  draft: "draft",
  review: "review",
  scheduled: "scheduled",
  published: "published",
  archived: "archived",
} as const;

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status in variantMap
      ? variantMap[status as keyof typeof variantMap]
      : "default";

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
