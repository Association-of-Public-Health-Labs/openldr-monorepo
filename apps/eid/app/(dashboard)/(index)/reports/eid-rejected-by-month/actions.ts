import { eidGetList } from "@/lib/eid/api";
import { rejectionSeries } from "@/lib/eid/series";
import type { RejectedByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num } from "@repo/design_system/lib/report/format";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<RejectedByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: rejectionSeries(rows),
});

/** One row per reason, then the API `total`, which can exceed the sum of the reasons (rejected by description only). */
export function toExcel(rows: RejectedByMonth[]): ExcelSheet {
  const sheet = chartToSheet(toChart(rows), "Motivo de rejeição");
  return { ...sheet, rows: [...sheet.rows, ["Total", ...rows.map((r) => num(r.total))]] };
}
