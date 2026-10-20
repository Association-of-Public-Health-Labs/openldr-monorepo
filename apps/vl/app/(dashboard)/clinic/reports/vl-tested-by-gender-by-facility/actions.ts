import { chartToSheet, genderSeries, type ChartModel } from "@/lib/vl/series";
import type { GenderByFacility } from "@/lib/vl/types";

export const toChart = (rows: GenderByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
