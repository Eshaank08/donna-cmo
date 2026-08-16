import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function ToolIcon({
  icon: Icon,
  live = true,
  size = "md",
}: {
  icon: LucideIcon;
  live?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px]",
        size === "sm" ? "size-[22px]" : "size-10",
        live ? "border-tool-live text-tool-live" : "border-border text-muted-foreground"
      )}
    >
      <Icon className={size === "sm" ? "size-[11px]" : "size-4.5"} strokeWidth={1.8} />
    </span>
  );
}

export function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "size-1.5 rounded-full",
        live ? "bg-tool-live" : "bg-border"
      )}
    />
  );
}
