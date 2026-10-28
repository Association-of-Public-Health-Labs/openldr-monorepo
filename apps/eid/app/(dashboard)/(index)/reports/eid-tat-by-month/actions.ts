import { eidGetList } from "@/lib/eid/api";
import { tatSeries } from "@/lib/eid/series";
import type { TatByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<TatByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]): ExcelSheet => chartToSheet(toChart(rows), "Tempo Resposta");
