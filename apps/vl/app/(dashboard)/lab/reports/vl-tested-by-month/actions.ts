import { vlGetList } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<TestedByMonth>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TestedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByMonth[]) => chartToSheet(toChart(rows), "Mês");
