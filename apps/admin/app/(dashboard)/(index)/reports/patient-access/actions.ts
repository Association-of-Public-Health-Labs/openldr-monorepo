import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { usageGetList } from "@/lib/admin/usage-api";
import { dashboardInfo, displayName, formatDateTime, resolveInChunks, type PatientAccess, type ResolvedUsers, type UsageFilters, formatCount } from "@/lib/admin/usage";
import { resolveUsers } from "@/app/(dashboard)/users/actions";
import { ENDPOINT } from "./constants";

export type PatientAccessData = { rows: PatientAccess[]; users: ResolvedUsers };

export async function fetchData(filters: UsageFilters, token: string | null): Promise<PatientAccessData> {
  const rows = await usageGetList<PatientAccess>(ENDPOINT, { interval_dates: intervalParam(filters.range), dashboard: filters.dashboard }, token);
  // One row per user and dashboard can run past the action's 100-id cap, so ask in chunks.
  const users = await resolveInChunks(rows.map((r) => r.user_id), resolveUsers).catch(() => ({}) as ResolvedUsers);
  return { rows, users };
}

export type PatientAccessRow = { key: string; name: string; dashboard: string; accesses: string; lastAccess: string };

export function toTable({ rows, users }: PatientAccessData): PatientAccessRow[] {
  return rows.map((r) => ({
    key: `${r.user_id}/${r.dashboard}`,
    name: displayName(r.user_id, users),
    dashboard: dashboardInfo(r.dashboard)?.name ?? r.dashboard,
    accesses: formatCount(r.accesses),
    lastAccess: formatDateTime(r.last_access),
  }));
}

export function toExcel(data: PatientAccessData): ExcelSheet {
  return {
    header: ["Nome", "Dashboard", "Consultas", "Última consulta"],
    rows: toTable(data).map((r) => [r.name, r.dashboard, r.accesses, r.lastAccess]),
  };
}
