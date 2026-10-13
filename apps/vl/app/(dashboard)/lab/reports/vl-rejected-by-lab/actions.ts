import { vlGetList } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RejectedByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<RejectedByLab>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: RejectedByLab[]): ChartModel => ({
  labels: rows.map((r) => r.testing_facility),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByLab[]) => chartToSheet(toChart(rows), "Laboratório");
