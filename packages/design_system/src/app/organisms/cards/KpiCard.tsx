import type { ReactNode } from "react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CARD_FRAME } from "./MainCard";

export type KpiTrend = {
  /** "+4.0%", "−0.4 p.p.", "−1 dia". */
  value: string;
  direction: "up" | "down";
  /** Whether this change is good news (green) or bad (red); for a turnaround time, down is good. */
  good: boolean;
  /** "vs mês anterior". */
  caption: string;
};

export type KpiCardProps = {
  title: string;
  /** Icon in the tinted chip before the title. */
  icon?: ReactNode;
  /** Accent of the icon chip (the chart takes its own colour). */
  color: string;
  value: ReactNode;
  trend?: KpiTrend | null;
  /** Under the title: what the value covers ("Últimos 12 meses"). */
  subtitle?: string;
  /** The expand button at the top right. */
  onExpand?: () => void;
  expandLabel?: string;
  /** Small chart at the bottom right. */
  children?: ReactNode;
  id?: string;
  className?: string;
};

/**
 * KPI tile: icon chip and title with an expand button, the large value and its trend on the left,
 * a small chart at the bottom right.
 */
export function KpiCard({ title, icon, color, value, trend, subtitle, onExpand, expandLabel, children, id, className }: KpiCardProps) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <section id={id} data-slot="kpi-card" className={cn(CARD_FRAME, "gap-5 p-5", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[18px]"
            style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] leading-5 font-semibold text-[#1C252E] dark:text-white">{title}</h3>
          {subtitle && <p className="truncate text-xs leading-[18px] text-[#919EAB]">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onExpand}
          aria-label={expandLabel ?? `Expandir ${title}`}
          className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[#637381] transition-colors hover:bg-[rgba(145,158,171,0.08)] hover:text-[#1C252E] focus-visible:bg-[rgba(145,158,171,0.16)] focus-visible:outline-none dark:text-[#919EAB] dark:hover:text-white"
        >
          <ArrowUpRight aria-hidden className="size-[18px]" />
        </button>
      </div>

      <div className="flex min-w-0 items-end justify-between gap-4">
        <div className="min-w-0 shrink-0">
          <p className="text-[32px] leading-[40px] font-bold tracking-tight whitespace-nowrap text-[#1C252E] tabular-nums dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-[13px] leading-5 whitespace-nowrap">
              <TrendIcon aria-hidden className={cn("size-4", trend.good ? "text-[#22C55E]" : "text-[#FF5630]")} />
              <span className={cn("font-semibold tabular-nums", trend.good ? "text-[#118D57] dark:text-[#77ED8B]" : "text-[#B71D18] dark:text-[#FFAC82]")}>
                {trend.value}
              </span>
              <span className="text-[#637381] dark:text-[#919EAB]">{trend.caption}</span>
            </p>
          )}
        </div>
        {children && <div className="w-[132px] max-w-[45%] min-w-[84px] shrink">{children}</div>}
      </div>
    </section>
  );
}

const BONE = "animate-pulse rounded-md bg-[rgba(145,158,171,0.2)]";

/** The KPI card's shape while its numbers load. */
export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(CARD_FRAME, "gap-5 p-5", className)}>
      <div className="flex items-center gap-3">
        <span className={cn(BONE, "size-9 rounded-[10px]")} />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className={cn(BONE, "h-3.5 w-32")} />
          <span className={cn(BONE, "h-3 w-20")} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <span className="flex flex-col gap-2">
          <span className={cn(BONE, "h-8 w-28")} />
          <span className={cn(BONE, "h-3.5 w-36")} />
        </span>
        <span className="flex h-16 w-[132px] max-w-[45%] items-end gap-[3px]">
          {[40, 62, 48, 75, 55, 68, 50, 82, 60, 72, 58, 90].map((h, i) => (
            <span key={i} className={cn(BONE, "flex-1 rounded-sm")} style={{ height: `${h}%` }} />
          ))}
        </span>
      </div>
    </div>
  );
}
