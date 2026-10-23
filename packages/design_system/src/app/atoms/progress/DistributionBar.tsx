import { cn } from "../../../lib/utils";
import { formatNumber } from "../../../lib/format-number";

export type DistributionSegment = {
  label: string;
  value: number;
  color: string;
  /** Text colour on the segment (dark or white, for contrast with `color`). */
  ink?: string;
};

export type DistributionBarProps = {
  segments: DistributionSegment[];
  /**
   * "micro": a thin bar (summary strips). "full": a 28px bar with each count inside its segment and
   * a legend with counts and shares underneath.
   */
  variant?: "micro" | "full";
  emptyLabel?: string;
  className?: string;
};

const share = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0);

/** How a total splits into ordered classes (TAT intervals, results…), as one stacked bar. */
export function DistributionBar({ segments, variant = "full", emptyLabel = "Sem dados", className }: DistributionBarProps) {
  const total = segments.reduce((n, s) => n + s.value, 0);
  const summary = segments.map((s) => `${s.label}: ${s.value}`).join(", ");

  if (variant === "micro") {
    return (
      <div role="img" aria-label={total ? summary : emptyLabel} className={cn("flex h-2 w-full gap-px overflow-hidden rounded-full bg-[rgba(145,158,171,0.16)]", className)}>
        {total > 0 &&
          segments.map((s) =>
            s.value > 0 ? <span key={s.label} title={`${s.label}: ${formatNumber(s.value)}`} style={{ flex: s.value, background: s.color }} /> : null,
          )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div role="img" aria-label={total ? summary : emptyLabel} className="flex h-7 w-full gap-0.5 overflow-hidden rounded-lg">
        {total > 0 ? (
          segments.map((s) =>
            s.value > 0 ? (
              <span
                key={s.label}
                className="flex min-w-0 items-center justify-center text-xs font-bold tabular-nums"
                style={{ flex: s.value, background: s.color, color: s.ink ?? "#1C252E" }}
              >
                {/* A count that doesn't fit its segment is in the legend. */}
                {share(s.value, total) >= 6 ? formatNumber(s.value) : ""}
              </span>
            ) : null,
          )
        ) : (
          <span className="flex flex-1 items-center justify-center bg-[rgba(145,158,171,0.16)] text-xs text-[#637381] dark:text-[#919EAB]">{emptyLabel}</span>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#637381] dark:text-[#919EAB]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
            {s.label}
            <b className="font-semibold text-[#1C252E] tabular-nums dark:text-white">{formatNumber(s.value)}</b>
            <span className="tabular-nums">{share(s.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
