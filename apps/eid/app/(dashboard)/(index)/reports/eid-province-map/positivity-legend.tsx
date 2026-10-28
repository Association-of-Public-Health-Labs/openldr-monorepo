import { EID_PRIMARY } from "@/lib/eid/series";
import { LABELS, MIN_RATIO, NO_DATA_COLOR } from "./constants";

const fmt = (value: number) => `${value.toFixed(1)}%`;

/** E2: the shade runs from 0 to the highest positivity shown; grey is "Sem dados". */
export function PositivityLegend({ max }: { max: number }) {
  const from = `color-mix(in srgb, ${EID_PRIMARY} ${MIN_RATIO * 100}%, transparent)`;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#637381] dark:text-[#919EAB]" aria-label="Legenda">
      <span className="flex items-center gap-1.5">
        {LABELS.LEGEND}
        <span className="tabular-nums">{fmt(0)}</span>
        <span aria-hidden className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(to right, ${from}, ${EID_PRIMARY})` }} />
        <span className="tabular-nums">{fmt(max)}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: NO_DATA_COLOR }} />
        {LABELS.NO_DATA}
      </span>
    </div>
  );
}
