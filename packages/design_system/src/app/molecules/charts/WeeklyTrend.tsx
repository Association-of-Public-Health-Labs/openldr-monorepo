"use client";

import { TargetTrend } from "../../atoms/charts/apex/TargetTrend";
import { cn } from "../../../lib/utils";

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
 * week's class colour (the period being viewed outlined).
 */
export function WeeklyTrend({ classColors, classLabels, labels, selected, ...chart }: WeeklyTrendProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <TargetTrend labels={labels} selected={selected} {...chart} />
      <div className="flex justify-between px-1 text-[11px] text-[#919EAB]">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
      {classColors && (
        <div className="flex gap-[3px] px-1" role="img" aria-label="Classe TAT de cada semana">
          {classColors.map((color, i) => {
            const current = selected && i >= selected.from && i <= selected.to;
            return (
              <span
                key={i}
                title={classLabels?.[i] ? `${labels[i]}: ${classLabels[i]}` : labels[i]}
                className={cn("h-1.5 flex-1 rounded-full", current && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-white dark:ring-offset-[#1d232a]")}
                style={{ background: color }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
