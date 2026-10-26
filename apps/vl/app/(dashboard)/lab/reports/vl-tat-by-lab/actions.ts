import { vlGetList } from "@/lib/vl/api";
import type { DateRange } from "@repo/design_system/lib/report/dates";
import { labParams, withLab } from "@/lib/vl/labs";
import { tatSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { TatByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGetList<TatByLab>(ENDPOINT, labParams(range, codes), token);

export const toChart = (all: TatByLab[]): ChartModel => {
  const rows = withLab(all);
  return {
    labels: rows.map((r) => r.testing_facility),
    series: tatSeries(rows),
  };
};

export const toExcel = (rows: TatByLab[]) => chartToSheet(toChart(rows), "Tempo Resposta");
