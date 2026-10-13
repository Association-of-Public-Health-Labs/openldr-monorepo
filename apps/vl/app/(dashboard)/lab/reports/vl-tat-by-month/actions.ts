import { vlGet } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TatByMonth[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]) => chartToSheet(toChart(rows), "Tempo Resposta");
