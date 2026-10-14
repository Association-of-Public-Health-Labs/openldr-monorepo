import { vlGetList } from "@/lib/vl/api";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import type { ChartModel } from "@/lib/vl/series";
import type { TatVsDisalinks } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (token: string | null) => vlGetList<TatVsDisalinks>(ENDPOINT, {}, token);

export const toChart = (rows: TatVsDisalinks[]): ChartModel => ({
  labels: rows.map((r) => r.semester),
  series: [
    { name: "TAT", type: "line", yAxis: 0, color: "#00b000", data: rows.map((r) => r.tat) },
    { name: "#Disalinks", type: "line", yAxis: 1, color: "#f8a200", data: rows.map((r) => r.disalinks) },
  ],
});

export const toExcel = (rows: TatVsDisalinks[]): ExcelSheet => ({
  header: ["", ...rows.map((r) => r.semester)],
  rows: [
    ["Tempo de Resposta", ...rows.map((r) => r.tat)],
    ["# Disalinks", ...rows.map((r) => r.disalinks)],
  ],
});
