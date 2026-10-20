import { vlGetList } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams, withLab } from "@/lib/vl/labs";
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<TestedByLab>(ENDPOINT, labParams(range, codes), token);

export const toChart = (all: TestedByLab[]): ChartModel => {
  const rows = withLab(all);
  return {
    labels: rows.map((r) => r.testing_facility),
    series: cvSeries(rows),
  };
};

export const toExcel = (rows: TestedByLab[]) => chartToSheet(toChart(rows), "Laboratório");
