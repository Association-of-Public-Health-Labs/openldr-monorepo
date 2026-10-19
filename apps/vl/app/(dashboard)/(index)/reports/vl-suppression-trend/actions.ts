import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { num } from "@/lib/vl/format";
import type { ChartModel } from "@/lib/vl/series";
import { suppressionRate } from "@/lib/vl/suppression";
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
