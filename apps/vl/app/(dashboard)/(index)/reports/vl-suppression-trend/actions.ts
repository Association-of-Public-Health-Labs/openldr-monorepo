import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { pct } from "@/lib/vl/format";
import type { ChartModel } from "@/lib/vl/series";
import type { SuppressionByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<SuppressionByMonth[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: SuppressionByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: [{ name: "Supressão Viral", type: "line", color: "#00b000", data: rows.map((r) => pct(r.suppressed, r.total)) }],
});

export function toExcel(rows: SuppressionByMonth[]): ExcelSheet {
  const chart = toChart(rows);
  return { header: ["Supressão Viral", ...chart.labels], rows: [["Total %", ...chart.series[0].data]] };
}
