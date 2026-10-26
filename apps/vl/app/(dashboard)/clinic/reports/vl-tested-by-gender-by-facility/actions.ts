import { genderSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { GenderByFacility } from "@/lib/vl/types";

export const toChart = (rows: GenderByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
