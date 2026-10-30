import { vlGetList } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import { labParams } from "@/lib/vl/labs";
import { tatSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<TatByMonth>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]) => chartToSheet(toChart(rows), "Tempo Resposta");
