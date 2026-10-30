"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { formatNumber } from "../../../lib/format-number";

export type IndicatorsRow = { label: string; values: ReactNode[] };

export type IndicatorsTableProps = {
  /** Header of the label column, then one per value column ("Out 2025", …). */
  columns: string[];
  rows: IndicatorsRow[];
  /** Accessible name of the table. */
  label?: string;
  id?: string;
  className?: string;
};

// Opaque colours throughout the sticky first column: the values scrolling under it must never show
// through (the old MUI table left it transparent). Body = card surface; hover = the 4% grey row tint
// already mixed into that surface, so it stays opaque too.
const HEAD = "bg-[#F4F6F8] dark:bg-[#28323D]";
const BODY = "bg-white dark:bg-[#1d232a]";
const HOVER = "group-hover:bg-[#F9FAFB] dark:group-hover:bg-[#20262e]";

// While scrolled, a soft shadow on the label column's edge, so cut-off values don't read as others
// ("871" half hidden looked like "371").
const EDGE =
  "after:pointer-events-none after:absolute after:inset-y-0 after:-right-3 after:w-3 after:bg-gradient-to-r after:from-[rgba(145,158,171,0.16)] after:to-transparent after:opacity-0 after:transition-opacity group-data-[scrolled]/table:after:opacity-100";

const numeric = (v: ReactNode) => typeof v === "number" || (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v));

/**
 * Indicators by period (rows are indicators, columns months), after the Minimals tables: grey header
 * band with rounded ends, the indicator names kept in view while the months scroll sideways.
 */
export function IndicatorsTable({ columns, rows, label, id, className }: IndicatorsTableProps) {
  const [first, ...periods] = columns;
  const [scrolled, setScrolled] = useState(false);
  return (
    <div
      id={id}
      data-slot="indicators-table"
      data-scrolled={scrolled || undefined}
      onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
      className={cn("group/table w-full overflow-x-auto", className)}
    >
      <table aria-label={label} className="w-full border-separate border-spacing-0 text-sm text-[#1C252E] dark:text-white">
        <thead>
          <tr>
            <th scope="col" className={cn(HEAD, EDGE, "sticky left-0 z-[2] rounded-l-lg px-4 py-2.5 text-left font-semibold whitespace-nowrap text-[#637381] dark:text-[#919EAB]")}>
              {first}
            </th>
            {periods.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={cn(HEAD, "px-3 py-2.5 text-center font-semibold whitespace-nowrap text-[#637381] dark:text-[#919EAB]", i === periods.length - 1 && "rounded-r-lg")}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="group">
              <th scope="row" className={cn(BODY, HOVER, EDGE, "sticky left-0 z-[1] px-4 py-3 text-left font-medium whitespace-nowrap transition-colors")}>
                {row.label}
              </th>
              {row.values.map((v, i) => (
                <td key={periods[i] ?? i} className={cn(BODY, HOVER, "px-3 py-3 text-center whitespace-nowrap tabular-nums transition-colors")}>
                  {numeric(v) ? formatNumber(Number(v)) : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
