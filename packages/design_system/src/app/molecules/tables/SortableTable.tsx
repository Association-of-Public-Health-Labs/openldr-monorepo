"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { cn } from "../../../lib/utils";

export type SortDirection = "asc" | "desc";

export type SortableColumn<Row> = {
  key: string;
  header: string;
  align?: "left" | "right";
  cell: (row: Row) => ReactNode;
  /** Makes the column sortable. */
  sortValue?: (row: Row) => number | string;
  /** Cell of the total row. */
  footer?: ReactNode;
  /** Hidden while the table is narrower than 640px (it scrolls sideways only if still too wide). */
  secondary?: boolean;
  className?: string;
};

export type SortableTableProps<Row> = {
  columns: SortableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Accessible name of the table. */
  label: string;
  defaultSort?: { key: string; direction: SortDirection };
  /** Shows a search field filtering on this text. */
  search?: { placeholder: string; text: (row: Row) => string };
  loading?: boolean;
  emptyMessage?: string;
  error?: { message: string; onRetry?: () => void } | null;
  /** Height of the scrolling area (header and total row stay in view). */
  maxHeight?: number;
  id?: string;
  className?: string;
};

// Minimals table: grey header band, dashed row lines, 14px rows.
const HEAD_CELL = "sticky top-0 z-[1] bg-[#F4F6F8] px-2.5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#637381] dark:bg-[#28323D] dark:text-[#919EAB]";
const BODY_CELL = "border-b border-dashed border-[rgba(145,158,171,0.2)] px-2.5 py-2.5";
const FOOT_CELL = "sticky bottom-0 z-[1] border-t border-[rgba(145,158,171,0.24)] bg-white px-2.5 py-2.5 font-semibold dark:bg-[#1d232a]";

// Secondary columns appear from a 640px-wide table up (container query on the table's frame).
const SECONDARY = "hidden @[640px]:table-cell";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function sortRows<Row>(rows: Row[], value: ((row: Row) => number | string) | undefined, direction: SortDirection): Row[] {
  if (!value) return rows;
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "pt");
    return order * sign;
  });
}

export function filterRows<Row>(rows: Row[], text: ((row: Row) => string) | undefined, query: string): Row[] {
  const q = normalize(query.trim());
  if (!text || !q) return rows;
  return rows.filter((row) => normalize(text(row)).includes(q));
}

/** Data table after the Minimals tables: sortable headers, optional search, total row, loading/empty/error states. */
export function SortableTable<Row>({
  columns,
  rows,
  rowKey,
  label,
  defaultSort,
  search,
  loading = false,
  emptyMessage = "Sem dados.",
  error,
  maxHeight = 360,
  id,
  className,
}: SortableTableProps<Row>) {
  const [sort, setSort] = useState(defaultSort);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    return sortRows(filterRows(rows, search?.text, query), column?.sortValue, sort?.direction ?? "desc");
  }, [rows, columns, sort, search, query]);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" }));

  const hasFooter = columns.some((c) => c.footer !== undefined);
  const showSkeleton = loading && rows.length === 0;

  return (
    <div id={id} data-slot="sortable-table" className={cn("@container flex w-full flex-col gap-3", className)}>
      {search && (
        <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-[rgba(145,158,171,0.2)] px-3 text-sm transition-colors focus-within:border-[#1C252E] hover:border-[#1C252E] sm:max-w-[280px] dark:focus-within:border-white dark:hover:border-white">
          <Search aria-hidden className="size-4 shrink-0 text-[#919EAB]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[#1C252E] outline-none placeholder:text-[#919EAB] dark:text-white"
          />
        </label>
      )}

      {error && rows.length === 0 ? (
        <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[rgba(145,158,171,0.08)] px-4 py-10 text-center text-sm text-[#637381] dark:text-[#919EAB]" style={{ minHeight: maxHeight / 2 }}>
          <p>{error.message}</p>
          {error.onRetry && (
            <button
              type="button"
              onClick={error.onRetry}
              className="h-8 rounded-lg border border-[rgba(145,158,171,0.32)] px-3 text-[13px] font-bold text-[#1C252E] transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:text-white"
            >
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        <div className="w-full overflow-auto rounded-xl" style={{ maxHeight }}>
          <table aria-label={label} aria-busy={loading || undefined} className="w-full border-separate border-spacing-0 text-sm text-[#1C252E] dark:text-white">
            <thead>
              <tr>
                {columns.map((c, i) => {
                  const active = sort?.key === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={active ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined}
                      className={cn(HEAD_CELL, c.align === "right" ? "text-right" : "text-left", i === 0 && "rounded-l-lg", i === columns.length - 1 && "rounded-r-lg", c.secondary && SECONDARY, c.className)}
                    >
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className={cn("inline-flex items-center gap-1 hover:text-[#1C252E] dark:hover:text-white", c.align === "right" && "flex-row-reverse", active && "text-[#1C252E] dark:text-white")}
                        >
                          {c.header}
                          {/* Only the sorted column carries an arrow, so narrow cards keep their width for data. */}
                          {active &&
                            (sort!.direction === "asc" ? (
                              <ArrowUp aria-hidden className="size-3.5 shrink-0" />
                            ) : (
                              <ArrowDown aria-hidden className="size-3.5 shrink-0" />
                            ))}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {showSkeleton
                ? Array.from({ length: 6 }, (_, r) => (
                    <tr key={r} aria-hidden>
                      {columns.map((c, i) => (
                        <td key={c.key} className={cn(BODY_CELL, c.secondary && SECONDARY)}>
                          <span className={cn("block h-3 animate-pulse rounded-full bg-[rgba(145,158,171,0.2)]", i === 0 ? "w-3/4" : "ml-auto w-8")} />
                        </td>
                      ))}
                    </tr>
                  ))
                : visible.map((row) => (
                    <tr key={rowKey(row)} className="transition-colors hover:bg-[rgba(145,158,171,0.04)]">
                      {columns.map((c) => (
                        <td key={c.key} className={cn(BODY_CELL, c.align === "right" ? "text-right tabular-nums" : "text-left", c.secondary && SECONDARY, c.className)}>
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
              {!showSkeleton && visible.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-10 text-center text-[#637381] dark:text-[#919EAB]">
                    {query ? "Nenhum resultado para a pesquisa." : emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
            {hasFooter && !showSkeleton && rows.length > 0 && (
              <tfoot>
                <tr>
                  {columns.map((c) => (
                    <td key={c.key} className={cn(FOOT_CELL, c.align === "right" ? "text-right tabular-nums" : "text-left", c.secondary && SECONDARY, c.className)}>
                      {c.footer}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

/** A percentage with a thin bar, for a share column ("9.3%"). */
export function BarValue({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span aria-hidden className="h-1.5 w-10 overflow-hidden rounded-full bg-[rgba(145,158,171,0.16)]">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="w-11 text-right tabular-nums">{pct.toFixed(1)}%</span>
    </span>
  );
}
