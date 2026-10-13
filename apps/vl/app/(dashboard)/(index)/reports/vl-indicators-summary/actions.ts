import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import type { IndicatorsByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export type IndicatorsTable = { columns: string[]; rows: { label: string; values: number[] }[] };

const INDICATORS: { label: string; key: keyof IndicatorsByMonth }[] = [
  { label: "Amostras Registadas", key: "registered" },
  { label: "Amostras Testadas", key: "tested" },
  { label: "Amostras com CV<1000", key: "suppressed" },
  { label: "Amostras não validadas", key: "non_validated" },
  { label: "Amostras Rejeitadas", key: "rejected" },
];

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<IndicatorsByMonth[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toTable = (rows: IndicatorsByMonth[]): IndicatorsTable => ({
  columns: rows.map((r) => monthLabel(r.year, r.month)),
  rows: INDICATORS.map(({ label, key }) => ({ label, values: rows.map((r) => Number(r[key]) || 0) })),
});

export function toExcel(rows: IndicatorsByMonth[]): ExcelSheet {
  const table = toTable(rows);
  return { header: ["Indicadores", ...table.columns], rows: table.rows.map((r) => [r.label, ...r.values]) };
}
