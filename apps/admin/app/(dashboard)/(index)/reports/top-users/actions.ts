import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { usageGetList } from "@/lib/admin/usage-api";
import { dashboardInfo, displayName, relativeDay, resolveInChunks, type ResolvedUsers, type TopUser, type UsageFilters, formatCount } from "@/lib/admin/usage";
import { resolveUsers } from "@/app/(dashboard)/users/actions";
import { ENDPOINT, LIMIT } from "./constants";

export type TopUsersData = { rows: TopUser[]; users: ResolvedUsers };

export async function fetchData(filters: UsageFilters, token: string | null): Promise<TopUsersData> {
  const rows = await usageGetList<TopUser>(ENDPOINT, { interval_dates: intervalParam(filters.range), dashboard: filters.dashboard, limit: LIMIT }, token);
  // A failed lookup shows "Utilizador removido" rather than hiding the ranking.
  const users = await resolveInChunks(rows.map((r) => r.user_id), resolveUsers).catch(() => ({}) as ResolvedUsers);
  return { rows, users };
}

export type TopUserRow = { id: string; name: string; email: string; href: string; tags: string[]; sessions: string; lastVisit: string };

export function toTable({ rows, users }: TopUsersData, now: Date = new Date()): TopUserRow[] {
  return rows.map((r) => ({
    id: r.user_id,
    name: displayName(r.user_id, users),
    email: users[r.user_id]?.email ?? "",
    href: `/users?user=${encodeURIComponent(r.user_id)}`,
    tags: r.dashboards.map((d) => dashboardInfo(d)?.tag ?? d),
    sessions: formatCount(r.sessions),
    lastVisit: relativeDay(r.last_visit, now),
  }));
}

export function toExcel(data: TopUsersData): ExcelSheet {
  return {
    header: ["Nome", "Email", "Dashboards", "Sessões", "Último acesso"],
    rows: toTable(data).map((r) => [r.name, r.email, r.tags.join(", "), r.sessions, r.lastVisit]),
  };
}
