import { monthLabel } from "@/lib/vl/dates";
import { chartToSheet, genderSeries, type ChartModel } from "@/lib/vl/series";
import type { GenderByMonth } from "@/lib/vl/types";

export const toChart = (rows: GenderByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
