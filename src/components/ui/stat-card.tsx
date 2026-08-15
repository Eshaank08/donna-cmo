import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  suffix,
  decimalPlaces,
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimalPlaces?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-card p-6", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <NumberTicker
          value={value}
          decimalPlaces={decimalPlaces}
          className="font-heading text-4xl"
        />
        {suffix && (
          <span className="text-lg text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}
