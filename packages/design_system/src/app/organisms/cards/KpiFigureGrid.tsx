import type { KpiFigure } from "../../../lib/report/kpi-detail";
import { cn } from "../../../lib/utils";
import { OVERLINE } from "../../molecules/metrics/overline";

const DIVIDER = "border-dashed border-[rgba(145,158,171,0.2)]";

/**
 * Dividers of one cell in the 2-column grid: a right rule on the left column, a top rule from the
 * second row on, never on the outer edge. A last, odd figure spans both columns.
 */
export function figureCellClass(index: number, count: number): string {
  const lastOdd = count % 2 === 1 && index === count - 1;
  return cn(
    "flex min-w-0 flex-col gap-1 px-4 py-3",
    lastOdd ? "col-span-2" : index % 2 === 0 && "border-r",
    index >= 2 && "border-t",
    DIVIDER,
  );
}

/**
 * The key figures of the KPI drawer: a 2 × 2 grid inside a solid hairline outline, which reads on the
 * drawer's translucent background (a SummaryStrip row wraps in 380px and loses its dividers).
 */
export function KpiFigureGrid({ figures, className }: { figures: KpiFigure[]; className?: string }) {
  return (
    <dl
      data-slot="kpi-figures"
      className={cn(
        "grid grid-cols-2 rounded-xl border border-solid border-[rgba(145,158,171,0.24)] bg-white dark:border-[rgba(145,158,171,0.16)] dark:bg-[#1d232a]",
        className,
      )}
    >
      {figures.map((f, i) => (
        <div key={f.label} className={figureCellClass(i, figures.length)}>
          <dt className={cn(OVERLINE, "break-words")}>{f.label}</dt>
          {/* Wraps instead of being cut: a long figure ("12 345 678") must fit a 170px cell. */}
          <dd className="text-lg leading-7 font-bold break-words text-[#1C252E] tabular-nums dark:text-white">{f.value}</dd>
          {f.note && <dd className="text-xs break-words text-[#637381] dark:text-[#919EAB]">{f.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
