import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGetList<TatByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]): ExcelSheet => chartToSheet(toChart(rows), "Tempo Resposta");
