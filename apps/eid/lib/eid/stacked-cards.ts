import { equipmentSeries, rejectionSeries } from "@/lib/eid/series";
import type { EquipmentByLab, EquipmentByMonth, RejectedByLab, RejectedByMonth } from "@/lib/eid/types";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num } from "@repo/design_system/lib/report/format";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";

/** Excel sheet of a stacked chart (one row per series), plus a last row carrying the API's own total. */
const withTotalRow = (chart: ChartModel, corner: string, label: string, totals: number[]): ExcelSheet => {
  const sheet = chartToSheet(chart, corner);
  return { ...sheet, rows: [...sheet.rows, [label, ...totals]] };
};

/** Monthly cards (Sumário and Laboratório share them). */
export const equipmentMonthChart = (rows: EquipmentByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: equipmentSeries(rows),
});
/** One row per analyser group, then the API `tested`. */
export const equipmentMonthExcel = (rows: EquipmentByMonth[]): ExcelSheet =>
  withTotalRow(equipmentMonthChart(rows), "Equipamento", "Testadas", rows.map((r) => num(r.tested)));

export const rejectedMonthChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: rejectionSeries(rows),
});
/** One row per reason, then the API `total`, which can exceed the sum of the reasons (rejected by description only; R10). */
export const rejectedMonthExcel = (rows: RejectedByMonth[]): ExcelSheet =>
  withTotalRow(rejectedMonthChart(rows), "Motivo de rejeição", "Total", rows.map((r) => num(r.total)));

/** Per-lab cards: one bar per lab. A row with no name would be a null category, which crashes ApexCharts. */
export const equipmentLabChart = (all: EquipmentByLab[]): ChartModel => {
  const rows = all.filter((r) => r.testing_facility);
  return { labels: rows.map((r) => r.testing_facility as string), series: equipmentSeries(rows) };
};
export const equipmentLabExcel = (all: EquipmentByLab[]): ExcelSheet =>
  withTotalRow(equipmentLabChart(all), "Laboratório", "Testadas", all.filter((r) => r.testing_facility).map((r) => num(r.tested)));

export const rejectedLabChart = (all: RejectedByLab[]): ChartModel => {
  const rows = all.filter((r) => r.receiving_facility);
  return { labels: rows.map((r) => r.receiving_facility as string), series: rejectionSeries(rows) };
};
export const rejectedLabExcel = (all: RejectedByLab[]): ExcelSheet =>
  withTotalRow(rejectedLabChart(all), "Laboratório", "Total", all.filter((r) => r.receiving_facility).map((r) => num(r.total)));
