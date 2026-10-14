import { monthLabel } from "@/lib/vl/dates";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
