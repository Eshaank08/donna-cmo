import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function TextLink({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon className="size-3.5" />
    </a>
  );
}
