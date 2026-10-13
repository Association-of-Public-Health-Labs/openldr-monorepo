import { vlGet } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RejectedByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<RejectedByMonth[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: singleSeries("Amostras Rejeitadas", "#fb8c00", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByMonth[]) => chartToSheet(toChart(rows), "Mês");
