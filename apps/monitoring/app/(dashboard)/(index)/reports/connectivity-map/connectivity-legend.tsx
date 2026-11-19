import { CONNECTIVITY_COLOR } from "@/lib/monitoring/colors";
import { LABELS, MIN_RATIO, NO_DATA_COLOR } from "./constants";

/** The shade runs from 0% to 100% connectivity (absolute); grey is a region without sites. */
export function ConnectivityLegend() {
  const from = `color-mix(in srgb, ${CONNECTIVITY_COLOR} ${MIN_RATIO * 100}%, transparent)`;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legenda">
      <span className="flex items-center gap-1.5">
        {LABELS.LEGEND}
        <span className="tabular-nums">0%</span>
        <span aria-hidden className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(to right, ${from}, ${CONNECTIVITY_COLOR})` }} />
        <span className="tabular-nums">100%</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: NO_DATA_COLOR }} />
        {LABELS.NO_DATA}
      </span>
    </div>
  );
}
