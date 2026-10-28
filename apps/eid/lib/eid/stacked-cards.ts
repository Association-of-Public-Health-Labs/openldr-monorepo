import { equipmentSeries, rejectionSeries } from "@/lib/eid/series";
import type { EquipmentByLab, EquipmentByMonth, RejectedByLab, RejectedByMonth } from "@/lib/eid/types";
import { uniqueLabLabels } from "@/lib/eid/lab-labels";
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

/** Per-lab cards: one bar per lab (a repeated name gets "(code)"). A row with no name would be a null category, which crashes ApexCharts. */
const labRows = <R extends { testing_facility_code?: string | null }>(all: R[], name: (r: R) => string | null | undefined, code: (r: R) => string | null | undefined) => {
  const rows = all.filter((r) => name(r));
  return { rows, labels: uniqueLabLabels(rows, (r) => name(r) as string, code) };
};

export const equipmentLabChart = (all: EquipmentByLab[]): ChartModel => {
  const { rows, labels } = labRows(all, (r) => r.testing_facility, (r) => r.testing_facility_code);
  return { labels, series: equipmentSeries(rows) };
};
export const equipmentLabExcel = (all: EquipmentByLab[]): ExcelSheet =>
  withTotalRow(equipmentLabChart(all), "Laboratório", "Testadas", all.filter((r) => r.testing_facility).map((r) => num(r.tested)));

export const rejectedLabChart = (all: RejectedByLab[]): ChartModel => {
  const { rows, labels } = labRows(all as (RejectedByLab & { testing_facility_code?: string })[], (r) => r.receiving_facility, (r) => r.receiving_facility_code);
  return { labels, series: rejectionSeries(rows) };
};
export const rejectedLabExcel = (all: RejectedByLab[]): ExcelSheet =>
  withTotalRow(rejectedLabChart(all), "Laboratório", "Total", all.filter((r) => r.receiving_facility).map((r) => num(r.total)));
