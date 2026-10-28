import { num } from "@repo/design_system/lib/report/format";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { EID_PRIMARY, EID_SECONDARY } from "./series";
import type { Month, RegisteredByFacility, RegisteredByFacilityByMonth, TestedByFacility, TestedByFacilityByMonth } from "./types";

type Split = { conventional: number; poc: number };
type TestedSplit = Split & { positive: number; negative: number };

/** Grouped (not stacked) Convencional / PoC columns (ruling C1). */
const splitSeries = (rows: Split[]) => [
  { name: "Convencional", color: EID_SECONDARY, data: rows.map((r) => num(r.conventional)) },
  { name: "PoC", color: EID_PRIMARY, data: rows.map((r) => num(r.poc)) },
];

const monthLabels = (rows: Month[]) => rows.map((r) => monthLabel(r.year, r.month));

/** The tested cards plot only the split; Positivas and Negativas go to the Excel (ruling C1). */
const withResult = (chart: ChartModel, rows: TestedSplit[], corner: string) => {
  const sheet = chartToSheet(chart, corner);
  sheet.rows.push(["Positivas", ...rows.map((r) => num(r.positive))], ["Negativas", ...rows.map((r) => num(r.negative))]);
  return sheet;
};

export const registeredChart = (rows: RegisteredByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility ?? ""),
  series: splitSeries(rows),
});
export const registeredExcel = (rows: RegisteredByFacility[], levelLabel: string) => chartToSheet(registeredChart(rows), levelLabel);

export const registeredMonthChart = (rows: RegisteredByFacilityByMonth[]): ChartModel => ({ labels: monthLabels(rows), series: splitSeries(rows) });
export const registeredMonthExcel = (rows: RegisteredByFacilityByMonth[]) => chartToSheet(registeredMonthChart(rows), "Mês");

export const testedChart = (rows: TestedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility ?? ""),
  series: splitSeries(rows),
});
export const testedExcel = (rows: TestedByFacility[], levelLabel: string) => withResult(testedChart(rows), rows, levelLabel);

export const testedMonthChart = (rows: TestedByFacilityByMonth[]): ChartModel => ({ labels: monthLabels(rows), series: splitSeries(rows) });
export const testedMonthExcel = (rows: TestedByFacilityByMonth[]) => withResult(testedMonthChart(rows), rows, "Mês");
