import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { num } from "@/lib/vl/format";
import { labParams } from "@/lib/vl/labs";
import type { ChartModel } from "@/lib/vl/series";
import type { WeeklyNationalRow } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<WeeklyNationalRow[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: WeeklyNationalRow[]): ChartModel => ({
  labels: rows.map((r) => r.week),
  series: [
    { name: "Registadas", color: "#00b000", data: rows.map((r) => num(r.registrations)) },
    { name: "Testadas", color: "#fb8c00", data: rows.map((r) => num(r.tests)) },
    { name: "Não processadas", color: "#e74c3c", data: rows.map((r) => num(r.backlogs)) },
    { name: "Capacidade", type: "line", color: "#7868e6", data: rows.map((r) => num(r.capacity)) },
    { name: "TRL", type: "line", yAxis: 1, color: "#37474f", data: rows.map((r) => num(r.tat)) },
  ],
});

export const toExcel = (rows: WeeklyNationalRow[]): ExcelSheet => ({
  header: ["", ...rows.map((r) => r.week)],
  rows: [
    ["Amostras Registadas", ...rows.map((r) => r.registrations)],
    ["Amostras Testadas", ...rows.map((r) => r.tests)],
    ["Amostras não processadas", ...rows.map((r) => r.backlogs)],
    ["Amostras Rejeitadas", ...rows.map((r) => r.rejections)],
    ["Capacidade Laboratorial (85%)", ...rows.map((r) => r.capacity)],
    ["Tempo de Resposta", ...rows.map((r) => r.tat)],
  ],
});
