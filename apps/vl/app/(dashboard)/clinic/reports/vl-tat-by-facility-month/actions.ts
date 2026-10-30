import { monthLabel } from "@repo/design_system/lib/report/dates";
import { tatSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { TatByMonth } from "@/lib/vl/types";

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
