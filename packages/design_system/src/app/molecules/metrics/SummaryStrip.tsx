import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { CARD_FRAME } from "../../organisms/cards/MainCard";
import { OVERLINE } from "./overline";

export { OVERLINE };

/**
 * A row of headline figures in one card, each section split from the next by a divider; on narrow
 * screens the sections wrap.
 */
export function SummaryStrip({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} data-slot="summary-strip" className={cn(CARD_FRAME, "flex-row flex-wrap items-stretch", className)}>
      {children}
    </section>
  );
}

export type SummaryStripItemProps = {
  /** Caption, as an overline. */
  label?: ReactNode;
  /** The figure ("55%", "105"). */
  value?: ReactNode;
  /** Shown beside the value (a bar, a sub-caption). */
  children?: ReactNode;
  /** Red figure and dot: the value calls for attention ("7 distritos fora do alvo"). */
  alert?: boolean;
  /** Takes the free width (the main figure). */
  grow?: boolean;
  className?: string;
};

export function SummaryStripItem({ label, value, children, alert, grow, className }: SummaryStripItemProps) {
  return (
    <div
      className={cn(
        // Dividers between sections: a left rule on every section but the first in its row.
        "flex min-w-[140px] flex-col justify-center gap-1 border-l border-dashed border-[rgba(145,158,171,0.2)] px-5 py-4 first:border-l-0",
        grow ? "flex-[2_1_260px]" : "flex-[1_1_140px]",
        className,
      )}
    >
      {value !== undefined && (
        <span
          className={cn(
            "flex items-center gap-1.5 text-2xl leading-8 font-bold tabular-nums",
            alert ? "text-[#B71D18] dark:text-[#FFAC82]" : "text-[#1C252E] dark:text-white",
          )}
        >
          {alert && <span aria-hidden className="size-2 rounded-full bg-[#FF5630]" />}
          {value}
        </span>
      )}
      {label && <span className={OVERLINE}>{label}</span>}
      {children}
    </div>
  );
}
