import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { tatSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGetList<TatByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]): ExcelSheet => chartToSheet(toChart(rows), "Tempo Resposta");
