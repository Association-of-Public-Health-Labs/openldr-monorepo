import type { RegisteredByMonth } from "@/lib/eid/types";
import { labFetch } from "@/lib/eid/lab-cards";
import { EID_PRIMARY, EID_SECONDARY } from "@/lib/eid/series";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import { num } from "@repo/design_system/lib/report/format";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<RegisteredByMonth>(ENDPOINT);

export const toChart = (rows: RegisteredByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: [
    { name: "Convencional", color: EID_SECONDARY, data: rows.map((r) => num(r.conventional)) },
    { name: "PoC", color: EID_PRIMARY, data: rows.map((r) => num(r.poc)) },
  ],
});

export const toExcel = (rows: RegisteredByMonth[]) => chartToSheet(toChart(rows), "Mês");
