import { eidGetList } from "@/lib/eid/api";
import type { IndicatorsByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { DEFAULT_TAB, ENDPOINT, TABS, type IndicatorsTab } from "./constants";

export type IndicatorsTable = { columns: string[]; rows: { label: string; values: number[] }[] };

const INDICATORS: { label: string; key: "registered" | "tested" | "rejected" | "pending" }[] = [
  { label: "Registadas", key: "registered" },
  { label: "Testadas", key: "tested" },
  { label: "Rejeitadas", key: "rejected" },
  { label: "Pendentes", key: "pending" },
];

/** The rows are tagged with their tab: the kit keeps the previous data while a new request loads. */
export type KeyIndicatorsData = { labType: IndicatorsTab; rows: IndicatorsByMonth[] };

export const fetchData = async (range: DateRange, labType: IndicatorsTab, token: string | null): Promise<KeyIndicatorsData> => ({
  labType,
  rows: await eidGetList<IndicatorsByMonth>(
    ENDPOINT,
    { interval_dates: intervalParam(range), ...(labType === "all" ? {} : { lab_type: labType }) },
    token,
  ),
});

/** Excel subtitle: the period plus the tab of the rows actually applied (`fallback` before any data). */
export const exportSubtitleFor = (base: string, data: KeyIndicatorsData | null | undefined, fallback: IndicatorsTab = DEFAULT_TAB) => {
  const labType = data?.labType ?? fallback;
  return `${base} | ${TABS.find((t) => t.value === labType)?.label ?? ""}`;
};

export const toTable = (rows: IndicatorsByMonth[]): IndicatorsTable => ({
  columns: rows.map((r) => monthLabel(r.year, r.month)),
  rows: INDICATORS.map(({ label, key }) => ({ label, values: rows.map((r) => Number(r[key]) || 0) })),
});

export function toExcel(rows: IndicatorsByMonth[]): ExcelSheet {
  const table = toTable(rows);
  return { header: ["Indicadores", ...table.columns], rows: table.rows.map((r) => [r.label, ...r.values]) };
}
