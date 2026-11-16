import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { monitoringGet } from "@/lib/monitoring/api";
import type { NationalSummary } from "@/lib/monitoring/types";

export function toDonut(summary: NationalSummary): { labels: ["Online", "Offline"]; series: [number, number] } {
  return { labels: ["Online", "Offline"], series: [summary.uptimePct, summary.downtimePct] };
}

export function toExcel(summary: NationalSummary): ExcelSheet {
  const { labels, series } = toDonut(summary);
  return { header: ["Estado", "Tempo (%)"], rows: labels.map((l, i) => [l, series[i]]) };
}

export const fetchData = () => monitoringGet<NationalSummary>("/api/summary");
