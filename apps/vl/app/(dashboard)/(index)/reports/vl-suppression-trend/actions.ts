import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num, sum } from "@repo/design_system/lib/report/format";
import type { ChartModel } from "@repo/design_system/lib/report/series";
import { formatRate, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGetList<SuppressionByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

/** Suppressed ÷ tests with a result, as on the map card; one decimal, 0 for months without results. */
const monthRate = (row: SuppressionByMonth) => {
  const rate = suppressionRate({ suppressed: num(row.suppressed), not_suppressed: num(row.not_suppressed) });
  return rate === null ? 0 : Math.round(rate * 10) / 10;
};

/** Tests as stacked columns (suppressed + not suppressed), the suppression rate as a line on the right axis. */
export const toChart = (rows: SuppressionByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: [
    { name: "Suprimidas", color: "#00B000", data: rows.map((r) => num(r.suppressed)) },
    { name: "Não suprimidas", color: "#EF5350", data: rows.map((r) => num(r.not_suppressed)) },
    { name: "Taxa de supressão", type: "line", yAxis: 1, color: "#006C9C", data: rows.map(monthRate) },
  ],
});

/** Short counts for the legend, as Minimals' "1.23k" ("1,4 M" in pt-PT). */
export const compact = (value: number) =>
  new Intl.NumberFormat("pt-PT", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export type LegendTotal = { name: string; color: string; value: string };

/** The period's totals shown above the chart, one per series. */
export function toTotals(rows: SuppressionByMonth[]): LegendTotal[] {
  const [suppressed, notSuppressed, rate] = toChart(rows).series;
  const s = sum(rows.map((r) => r.suppressed));
  const ns = sum(rows.map((r) => r.not_suppressed));
  return [
    { name: suppressed.name, color: suppressed.color, value: compact(s) },
    { name: notSuppressed.name, color: notSuppressed.color, value: compact(ns) },
    { name: rate.name, color: rate.color, value: formatRate(suppressionRate({ suppressed: s, not_suppressed: ns })) },
  ];
}

export function toExcel(rows: SuppressionByMonth[]): ExcelSheet {
  const chart = toChart(rows);
  const [suppressed, notSuppressed, rate] = chart.series;
  return {
    header: ["Supressão Viral", ...chart.labels],
    rows: [
      [suppressed.name, ...suppressed.data],
      [notSuppressed.name, ...notSuppressed.data],
      ["Amostras testadas", ...rows.map((r) => num(r.total))],
      ["Taxa de supressão (%)", ...rate.data],
    ],
  };
}
