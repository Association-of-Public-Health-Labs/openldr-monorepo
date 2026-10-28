import { eidGetList } from "@/lib/eid/api";
import { equipmentSeries } from "@/lib/eid/series";
import type { EquipmentByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num } from "@repo/design_system/lib/report/format";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<EquipmentByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: EquipmentByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: equipmentSeries(rows),
});

/** One row per analyser group, then the API `tested`. */
export function toExcel(rows: EquipmentByMonth[]): ExcelSheet {
  const sheet = chartToSheet(toChart(rows), "Equipamento");
  return { ...sheet, rows: [...sheet.rows, ["Testadas", ...rows.map((r) => num(r.tested))]] };
}
