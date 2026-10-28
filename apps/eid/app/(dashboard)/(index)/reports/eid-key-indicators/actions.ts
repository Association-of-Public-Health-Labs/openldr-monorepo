import { eidGetList } from "@/lib/eid/api";
import type { IndicatorsByMonth, LabType } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { ENDPOINT } from "./constants";

export type IndicatorsTable = { columns: string[]; rows: { label: string; values: number[] }[] };

const INDICATORS: { label: string; key: "registered" | "tested" | "rejected" | "pending" }[] = [
  { label: "Registadas", key: "registered" },
  { label: "Testadas", key: "tested" },
  { label: "Rejeitadas", key: "rejected" },
  { label: "Pendentes", key: "pending" },
];

export const fetchData = (range: DateRange, labType: LabType, token: string | null) =>
  eidGetList<IndicatorsByMonth>(ENDPOINT, { interval_dates: intervalParam(range), lab_type: labType }, token);

export const toTable = (rows: IndicatorsByMonth[]): IndicatorsTable => ({
  columns: rows.map((r) => monthLabel(r.year, r.month)),
  rows: INDICATORS.map(({ label, key }) => ({ label, values: rows.map((r) => Number(r[key]) || 0) })),
});

export function toExcel(rows: IndicatorsByMonth[]): ExcelSheet {
  const table = toTable(rows);
  return { header: ["Indicadores", ...table.columns], rows: table.rows.map((r) => [r.label, ...r.values]) };
}
