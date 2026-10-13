import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TatByLab[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TatByLab[]): ChartModel => ({
  labels: rows.map((r) => r.testing_facility),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByLab[]) => chartToSheet(toChart(rows), "Tempo Resposta");
