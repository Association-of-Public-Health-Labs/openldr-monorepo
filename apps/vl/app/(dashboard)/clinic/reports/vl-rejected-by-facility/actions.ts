import { chartToSheet, singleSeries, type ChartModel } from "@repo/design_system/lib/report/series";
import type { RegisteredByFacility } from "@/lib/vl/types";

export const toChart = (rows: RegisteredByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RegisteredByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
