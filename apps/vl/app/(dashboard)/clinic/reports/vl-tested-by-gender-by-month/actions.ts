import { monthLabel } from "@repo/design_system/lib/report/dates";
import { genderSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { GenderByMonth } from "@/lib/vl/types";

export const toChart = (rows: GenderByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
