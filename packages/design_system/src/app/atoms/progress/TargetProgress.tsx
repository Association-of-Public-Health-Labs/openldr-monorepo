import { cn } from "../../../lib/utils";

export type TargetProgressProps = {
  /** Share reached, 0–1; null when there is no data (empty track). */
  value: number | null;
  /** Target share, 0–1, drawn as a tick on the track. */
  target: number;
  /** "md" adds the "alvo" caption over the tick. */
  size?: "sm" | "md";
  /** Bar colour (default: the dashboard colour). */
  color?: string;
  className?: string;
};

/**
 * A share against its target, after the Minimals progress bars: rounded grey track, the share in
 * the dashboard colour, a dark tick where the target sits.
 */
export function TargetProgress({ value, target, size = "sm", color = "var(--primary)", className }: TargetProgressProps) {
  const pct = Math.max(0, Math.min(1, value ?? 0)) * 100;
  const tick = Math.max(0, Math.min(1, target)) * 100;
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value === null ? undefined : Math.round(pct)}
      aria-label={`${value === null ? "Sem dados" : `${Math.round(pct)}%`} (alvo ${Math.round(tick)}%)`}
      className={cn("relative w-full", size === "md" && "pt-4", className)}
    >
      <div className={cn("overflow-hidden rounded-full bg-[rgba(145,158,171,0.16)]", size === "md" ? "h-2" : "h-1.5")}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span
        aria-hidden
        className={cn("absolute w-0.5 rounded-full bg-[#1C252E] dark:bg-white", size === "md" ? "bottom-[-3px] h-3.5" : "-top-[3px] h-3")}
        style={{ left: `calc(${tick}% - 1px)` }}
      />
      {size === "md" && (
        <span aria-hidden className="absolute top-0 -translate-x-1/2 text-[10px] leading-3 text-[#919EAB]" style={{ left: `${tick}%` }}>
          alvo
        </span>
      )}
    </div>
  );
}
