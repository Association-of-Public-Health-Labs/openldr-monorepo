"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../../../components/ui/skeleton";
import { cn } from "../../../lib/utils";

export type CardLoadingView = "none" | "skeleton" | "refresh";

/** First load (nothing drawn yet): a chart skeleton. Later loads (filters, tabs): the chart stays, dimmed, under a progress bar. */
export function cardLoadingView(loading: boolean, settled: boolean, progressOnly = false): CardLoadingView {
  if (!loading) return "none";
  return settled || progressOnly ? "refresh" : "skeleton";
}

/**
 * Which loading state a card shows; a card has "settled" once a load has finished.
 * `progressOnly`: never the skeleton (a card whose first load is a user action, e.g. a search).
 */
export function useCardLoadingView(loading: boolean, progressOnly = false): CardLoadingView {
  const [settled, setSettled] = useState(false);
  const started = useRef(false);
  useEffect(() => {
    if (loading) started.current = true;
    else if (started.current) setSettled(true);
  }, [loading]);
  return cardLoadingView(loading, settled, progressOnly);
}

// Minimals skeleton: grey at 20%, 8px radius.
const BONE = "rounded-lg bg-[rgba(145,158,171,0.2)]";
// Column heights (%) of the placeholder chart.
const COLUMNS = [45, 70, 55, 85, 60, 40, 75, 50, 65, 80, 35, 58];

/** Placeholder chart over the card body: legend chips, gridlines and columns, pulsing. */
export function CardChartSkeleton() {
  return (
    <div
      role="status"
      data-slot="card-skeleton"
      className="absolute inset-0 z-10 flex flex-col gap-5 bg-white px-6 pt-6 pb-6 dark:bg-[#1d232a]"
    >
      <span className="sr-only">A carregar…</span>
      <div aria-hidden className="flex gap-4">
        <Skeleton className={cn(BONE, "h-3 w-20")} />
        <Skeleton className={cn(BONE, "h-3 w-24")} />
      </div>
      <div aria-hidden className="relative flex min-h-0 flex-1 items-end gap-[3%] pl-8">
        {/* Dashed gridlines and y-axis ticks, as the Minimals charts. */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className={cn(BONE, "h-2 w-5 shrink-0")} />
              <div className="flex-1 border-t border-dashed border-[rgba(145,158,171,0.2)]" />
            </div>
          ))}
        </div>
        {COLUMNS.map((h, i) => (
          <Skeleton key={i} className={cn(BONE, "relative flex-1 rounded-b-none")} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Thin bar in the dashboard colour along the top of the card while it reloads. */
export function CardProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="A atualizar"
      data-slot="card-progress"
      className="absolute inset-x-0 top-0 z-10 h-[3px] overflow-hidden bg-[color-mix(in_srgb,var(--primary)_24%,transparent)]"
    >
      <div className="card-progress-bar h-full w-2/5 rounded-full bg-primary" />
    </div>
  );
}
