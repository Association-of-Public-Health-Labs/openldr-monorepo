import { num } from "@repo/design_system/lib/report/format";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { bracketSeries, EID_PRIMARY, EID_SECONDARY, genderSeries, rejectionSeries, tatSeries } from "./series";
import { withTotalRow } from "./stacked-cards";
import type { TatAvgByFacility, TatAvgByFacilityByMonth, TatDaysByFacility, TatDaysByFacilityByMonth, GenderByFacility, GenderByFacilityByMonth, Month, RegisteredByFacility, RejectedByFacility, RegisteredByFacilityByMonth, TestedByFacility, TestedByFacilityByMonth } from "./types";

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

/** Rejected by place (facility rule, R20): nine reasons, then the API `total`, which can exceed their sum (R10). */
export const rejectedFacilityChart = (rows: RejectedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility ?? ""),
  series: rejectionSeries(rows),
});
export const rejectedFacilityExcel = (rows: RejectedByFacility[], levelLabel: string) =>
  withTotalRow(rejectedFacilityChart(rows), levelLabel, "Total", rows.map((r) => num(r.total)));

/** Two stacks, Masculino and Feminino (ruling C2). */
export const genderChart = (rows: GenderByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility ?? ""),
  series: genderSeries(rows),
});
export const genderExcel = (rows: GenderByFacility[], levelLabel: string) => chartToSheet(genderChart(rows), levelLabel);

export const genderMonthChart = (rows: GenderByFacilityByMonth[]): ChartModel => ({ labels: monthLabels(rows), series: genderSeries(rows) });
export const genderMonthExcel = (rows: GenderByFacilityByMonth[]) => chartToSheet(genderMonthChart(rows), "Mês");

/** Average days per segment, stacked in chain order (legacy 9, 10). */
export const tatAvgChart = (rows: TatAvgByFacility[]): ChartModel => ({ labels: rows.map((r) => r.requesting_facility ?? ""), series: tatSeries(rows) });
export const tatAvgExcel = (rows: TatAvgByFacility[], levelLabel: string) => chartToSheet(tatAvgChart(rows), levelLabel);
export const tatAvgMonthChart = (rows: TatAvgByFacilityByMonth[]): ChartModel => ({ labels: monthLabels(rows), series: tatSeries(rows) });
export const tatAvgMonthExcel = (rows: TatAvgByFacilityByMonth[]) => chartToSheet(tatAvgMonthChart(rows), "Mês");

/** Samples per day bracket for one chosen segment (legacy 11, 12). */
export const tatDaysChart = (rows: TatDaysByFacility[]): ChartModel => ({ labels: rows.map((r) => r.requesting_facility ?? ""), series: bracketSeries(rows) });
export const tatDaysExcel = (rows: TatDaysByFacility[], levelLabel: string) => chartToSheet(tatDaysChart(rows), levelLabel);
export const tatDaysMonthChart = (rows: TatDaysByFacilityByMonth[]): ChartModel => ({ labels: monthLabels(rows), series: bracketSeries(rows) });
export const tatDaysMonthExcel = (rows: TatDaysByFacilityByMonth[]) => chartToSheet(tatDaysMonthChart(rows), "Mês");
