import { vlGetList } from "@/lib/vl/api";
import type { DateRange } from "@repo/design_system/lib/report/dates";
import { labParams, withLab } from "@/lib/vl/labs";
import { chartToSheet, singleSeries, type ChartModel } from "@repo/design_system/lib/report/series";
import type { RejectedByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<RejectedByLab>(ENDPOINT, labParams(range, codes), token);

export const toChart = (all: RejectedByLab[]): ChartModel => {
  const rows = withLab(all);
  return {
    labels: rows.map((r) => r.testing_facility),
    series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
  };
};

export const toExcel = (rows: RejectedByLab[]) => chartToSheet(toChart(rows), "Laboratório");
