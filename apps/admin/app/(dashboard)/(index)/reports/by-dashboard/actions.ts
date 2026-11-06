import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { usageGetList } from "@/lib/admin/usage-api";
import { formatDecimal, usageRegistry, type DashboardUsage, type UsageFilters, formatCount } from "@/lib/admin/usage";
import { ENDPOINT } from "./constants";

export const fetchData = (filters: UsageFilters, token: string | null) =>
  usageGetList<DashboardUsage>(ENDPOINT, { interval_dates: intervalParam(filters.range) }, token);

export type DashboardTableRow = { id: string; name: string; color: string; activeUsers: string; sessions: string; perUser: string };

/** One row per dashboard of the registry that has activity, in registry order; unknown dashboards are left out. */
export function toTable(rows: DashboardUsage[]): DashboardTableRow[] {
  return usageRegistry().flatMap((d) => {
    const row = rows.find((r) => r.dashboard === d.id);
    return row
      ? [{ id: d.id, name: d.name, color: d.color, activeUsers: formatCount(row.active_users), sessions: formatCount(row.sessions), perUser: formatDecimal(row.sessions_per_user) }]
      : [];
  });
}

export function toExcel(rows: DashboardUsage[]): ExcelSheet {
  return {
    header: ["Dashboard", "Utilizadores activos", "Sessões", "Sessões por utilizador"],
    rows: toTable(rows).map((r) => [r.name, r.activeUsers, r.sessions, r.perUser]),
  };
}
