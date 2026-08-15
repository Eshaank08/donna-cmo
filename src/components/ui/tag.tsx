import { cn } from "@/lib/utils";

export function Tag({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-sm text-muted-foreground/80",
        className
      )}
      {...props}
    />
  );
}
