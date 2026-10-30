"use client";

import { patientCells, patientRowKey, type PatientColumn, type PatientRecord } from "../../../lib/report/patients";
import { cn } from "../../../lib/utils";

// Minimals table: sticky grey header band, dashed row lines.
const HEAD = "sticky top-0 z-[1] bg-[#F4F6F8] px-3 py-2.5 text-left text-[13px] font-semibold whitespace-nowrap text-[#637381] first:rounded-l-lg last:rounded-r-lg dark:bg-[#28323D] dark:text-[#919EAB]";
const CELL = "border-b border-dashed border-[rgba(145,158,171,0.2)] px-3 py-2.5 whitespace-nowrap";

// A cell as a soft badge: green good, red bad.
function Badge({ label, tone }: { label: string; tone: "good" | "bad" }) {
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
        tone === "good" ? "bg-[rgba(34,197,94,0.16)] text-[#118D57] dark:text-[#77ED8B]" : "bg-[rgba(255,86,48,0.16)] text-[#B71D18] dark:text-[#FFAC82]",
      )}
    >
      {label}
    </span>
  );
}

export function PatientsTable({ rows, columns }: { rows: PatientRecord[]; columns: PatientColumn[] }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl">
      <table className="w-full border-separate border-spacing-0 text-sm text-[#1C252E] dark:text-white">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={HEAD}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={patientRowKey(row, index)} className="transition-colors hover:bg-[rgba(145,158,171,0.04)]">
              {patientCells(columns, row).map((cell, i) => {
                const column = columns[i]!;
                return (
                  <td key={column.key} className={cn(CELL, typeof cell === "number" && "tabular-nums")}>
                    {column.badge ? <Badge label={String(cell ?? "")} tone={column.badge(String(cell ?? ""))} /> : (cell ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The table's shape while the patients load. */
export function PatientsTableSkeleton({ columns, rows = 6 }: { columns: PatientColumn[]; rows?: number }) {
  const shown = columns.slice(0, 8);
  return (
    <div aria-hidden className="overflow-hidden rounded-xl">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {shown.map((c) => (
              <th key={c.key} className={HEAD}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {shown.map((c, i) => (
                <td key={c.key} className={CELL}>
                  <span className={cn("block h-3 animate-pulse rounded-full bg-[rgba(145,158,171,0.2)]", i === 0 ? "w-24" : "w-14")} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
