import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 text-zinc-800",
        draft: "bg-zinc-200 text-zinc-700",
        review: "bg-amber-100 text-amber-800",
        scheduled: "bg-blue-100 text-blue-800",
        published: "bg-green-100 text-green-800",
        archived: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
