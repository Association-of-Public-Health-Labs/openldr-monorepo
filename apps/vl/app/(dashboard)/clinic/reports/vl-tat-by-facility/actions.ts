import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByFacility } from "@/lib/vl/types";

export const toChart = (rows: TatByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
