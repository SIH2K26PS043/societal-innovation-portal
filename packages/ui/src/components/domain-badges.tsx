import * as React from "react";
import { Users } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { categoryColor } from "../lib/category-colors";

/** Maps ProblemStatus -> a semantic Badge variant. */
const STATUS_VARIANT: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  SUBMITTED: "outline",
  VALIDATED: "secondary",
  CLUSTERED: "secondary",
  ROUTED: "default",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  REJECTED: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status.replace(/_/g, " ")}</Badge>;
}

/** Category chip colored from the single category-colors map. */
export function CategoryBadge({ category }: { category: string }) {
  const color = categoryColor(category);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {category.replace(/_/g, " ")}
    </span>
  );
}

/** "reported by N" cluster indicator. */
export function ClusterBadge({ size, className }: { size: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-muted-foreground", className)}>
      <Users className="h-3.5 w-3.5" />
      reported by {size}
    </span>
  );
}
