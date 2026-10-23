"use client";

import { memo, useState } from "react";
import { TargetTrend } from "../../atoms/charts/apex/TargetTrend";
import { cn } from "../../../lib/utils";

// Hovering only changes the strip: the chart itself must not re-render (Apex would redraw).
const Trend = memo(TargetTrend);

export type WeeklyTrendProps = {
  id?: string;
  labels: string[];
  values: (number | null)[];
  target: number;
  selected?: { from: number; to: number };
  detail?: (index: number) => string;
  /** One colour per week (its class), drawn as a strip under the chart. */
  classColors?: string[];
  /** Week of a strip cell, for its tooltip ("2–8 Nov: 7-15 dias"). */
  classLabels?: string[];
  color?: string;
  height?: number;
};

/**
 * The weekly share against the target, then the first and last week, then a strip with each
 * week's class colour (the period being viewed outlined, the week under the cursor raised).
 */
export function WeeklyTrend({ classColors, classLabels, labels, selected, ...chart }: WeeklyTrendProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <Trend labels={labels} selected={selected} onHover={setHovered} {...chart} />
      <div className="flex justify-between px-1 text-[11px] text-[#919EAB]">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
      {classColors && (
        <div className="flex gap-[3px] px-1" role="img" aria-label="Classe TAT de cada semana" onMouseLeave={() => setHovered(null)}>
          {classColors.map((color, i) => {
            const current = selected && i >= selected.from && i <= selected.to;
            return (
              <span
                key={i}
                title={classLabels?.[i] ? `${labels[i]}: ${classLabels[i]}` : labels[i]}
                onMouseEnter={() => setHovered(i)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-transform duration-100",
                  hovered === i && "scale-y-[1.7]",
                  current && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-white dark:ring-offset-[#1d232a]",
                )}
                style={{ background: color }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
