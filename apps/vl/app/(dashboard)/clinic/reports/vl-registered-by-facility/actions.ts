import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RegisteredByFacility } from "@/lib/vl/types";

export const toChart = (rows: RegisteredByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: singleSeries("Amostras Registadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RegisteredByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
