import { cvSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { TestedByFacility } from "@/lib/vl/types";

export const toChart = (rows: TestedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
