import { monthLabel } from "@repo/design_system/lib/report/dates";
import { chartToSheet, singleSeries, type ChartModel } from "@repo/design_system/lib/report/series";
import type { RejectedByMonth } from "@/lib/vl/types";

export const toChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
