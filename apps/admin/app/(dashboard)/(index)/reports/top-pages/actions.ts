import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { usageGetList } from "@/lib/admin/usage-api";
import { dashboardInfo, type TopPage, type UsageFilters, formatCount } from "@/lib/admin/usage";
import { ENDPOINT, LIMIT } from "./constants";

export const fetchData = (filters: UsageFilters, token: string | null) =>
  usageGetList<TopPage>(ENDPOINT, { interval_dates: intervalParam(filters.range), dashboard: filters.dashboard, limit: LIMIT }, token);

/** "/" is each dashboard's home page, which its menu calls Sumário. */
export const pageName = (page: string) => (page === "/" || page === "" ? "Sumário" : page);

export type PageBar = { key: string; label: string; views: string; share: number };

/** Bars scaled to the most viewed page. */
export function toBars(rows: TopPage[]): PageBar[] {
  const max = Math.max(0, ...rows.map((r) => r.views));
  return rows.map((r) => ({
    key: `${r.dashboard}${r.page}`,
    label: `${dashboardInfo(r.dashboard)?.name ?? r.dashboard} · ${pageName(r.page)}`,
    views: formatCount(r.views),
    share: max > 0 ? Math.round((r.views / max) * 100) : 0,
  }));
}

export function toExcel(rows: TopPage[]): ExcelSheet {
  return { header: ["Página", "Visualizações"], rows: toBars(rows).map((b) => [b.label, b.views]) };
}
