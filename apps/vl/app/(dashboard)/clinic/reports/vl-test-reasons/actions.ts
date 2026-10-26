import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { sum } from "@repo/design_system/lib/report/format";
import type { ChartModel } from "@repo/design_system/lib/report/series";
import type { TestReasonByFacility } from "@/lib/vl/types";
import { PIE_COLORS } from "./constants";

const LABELS = ["Motivo não especificado", "Rotina", "Falência Terapêutica"];

/** The API returns one row per location; the legacy card showed national totals of 3 reasons. */
export const toChart = (rows: TestReasonByFacility[]): ChartModel => ({
  labels: LABELS,
  series: [
    {
      name: "Amostras",
      color: PIE_COLORS[0],
      data: [
        sum(rows.map((r) => r.reason_not_specified)),
        sum(rows.map((r) => r.routine)),
        sum(rows.map((r) => r.treatment_failure)),
      ],
    },
  ],
});

export function toExcel(rows: TestReasonByFacility[], _levelLabel: string): ExcelSheet {
  const chart = toChart(rows);
  return { header: ["", ...chart.labels], rows: [["Amostras", ...chart.series[0].data]] };
}
