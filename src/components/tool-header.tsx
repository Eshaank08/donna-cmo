import { ToolIcon } from "@/components/tool-icon";
import type { LucideIcon } from "lucide-react";

export function ToolHeader({
  icon,
  live = true,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  live?: boolean;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <ToolIcon icon={icon} live={live} />
        <div>
          <h1 className="font-heading text-2xl leading-tight">{title}</h1>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            {description}
          </p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
