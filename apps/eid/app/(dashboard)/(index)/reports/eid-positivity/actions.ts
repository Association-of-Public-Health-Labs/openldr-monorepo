import { eidGetList } from "@/lib/eid/api";
import { EID_PRIMARY } from "@/lib/eid/series";
import type { PositivityByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num } from "@repo/design_system/lib/report/format";
import type { ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<PositivityByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

/** Tested as columns (left axis); positivity from the API (positive ÷ tested) as a line on the right axis. num() turns null into 0. */
export const toChart = (rows: PositivityByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: [
    { name: "Testadas", type: "column", yAxis: 0, color: EID_PRIMARY, data: rows.map((r) => num(r.tested)) },
    { name: "Positividade (%)", type: "line", yAxis: 1, color: "#006C9C", data: rows.map((r) => num(r.positivity)) },
  ],
});

/** Conventional and PoC positives are only exported: they do not add up to `positive` (rows without an analyser). */
export function toExcel(rows: PositivityByMonth[]): ExcelSheet {
  const chart = toChart(rows);
  const [tested, rate] = chart.series;
  const col = (pick: (r: PositivityByMonth) => number | null) => rows.map((r) => num(pick(r)));
  return {
    header: ["Positividade", ...chart.labels],
    rows: [
      [tested.name, ...tested.data],
      ["Positivas", ...col((r) => r.positive)],
      ["Negativas", ...col((r) => r.negative)],
      ["Indeterminadas", ...col((r) => r.indeterminate)],
      ["Positivas Convencional", ...col((r) => r.conventional_positive)],
      ["Positivas PoC", ...col((r) => r.poc_positive)],
      [rate.name, ...rate.data],
    ],
  };
}
