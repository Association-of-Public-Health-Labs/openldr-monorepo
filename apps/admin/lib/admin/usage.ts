import { getDashboards, type DashboardId } from "@repo/design_system/dashboards";
import { PT_MONTHS_SHORT, monthLabel, toIsoDate, type DateRange } from "@repo/design_system/lib/report/dates";
import type { KpiTrend } from "@repo/design_system/app/organisms/cards/KpiCard";
import type { ChartModel } from "@repo/design_system/lib/report/series";
import { DASHBOARD_OPTIONS } from "@/app/(dashboard)/users/reports/user-panel/form";

/** Rows of the admin-only /usage/* endpoints. */
export type UsageSummary = {
  active_users: number;
  sessions: number;
  sessions_per_user: number;
  previous: { active_users: number; sessions: number };
};
export type ActiveUsersMonth = { year: number; month: number; dashboard: string; active_users: number };
export type DashboardUsage = { dashboard: string; active_users: number; sessions: number; sessions_per_user: number };
export type TopUser = { user_id: string; dashboards: string[]; sessions: number; last_visit: string | null };
export type TopPage = { dashboard: string; page: string; views: number };
export type PatientAccess = { user_id: string; dashboard: string; accesses: number; last_access: string | null };

export type ResolvedUsers = Record<string, { name: string; email: string }>;

/** The page-level filters every card shares; `label` is the period as the user picked it ("Últimos 30 dias"). */
export type UsageFilters = { range: DateRange; dashboard: string | undefined; label: string };

export const USER_REMOVED = "Utilizador removido";
const MAX_IDS = 100;
const MINUS = "−";

/** The dashboards usage is tracked for: the registry's names and colours, without the admin app itself. */
export function usageRegistry() {
  return getDashboards()
    .filter((d) => d.id !== "admin")
    .map((d) => ({
      id: d.id as DashboardId,
      name: d.name,
      color: d.primary,
      tag: DASHBOARD_OPTIONS.find((o) => o.id === d.id)?.tag ?? d.id.toUpperCase(),
    }));
}

export const dashboardInfo = (id: string) => usageRegistry().find((d) => d.id === id);

/** "+8%" against the period before; no trend (not Infinity) when there is nothing to compare with. */
export function trendVsPrevious(current: number, previous: number | null | undefined): KpiTrend | null {
  if (typeof previous !== "number" || !Number.isFinite(previous) || previous <= 0) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  return {
    value: `${change < 0 ? MINUS : "+"}${Math.abs(change)}%`,
    direction: change < 0 ? "down" : "up",
    good: change >= 0,
    caption: "vs período anterior",
  };
}

/** The last `days` days, today included. */
export function lastDays(days: number, today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
  return { start: toIsoDate(start), end: toIsoDate(today) };
}

/** The 12 calendar months ending with the current one, and the date range that covers them. */
export function last12Months(today: Date = new Date()) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const first = months[0];
  return { months, range: { start: `${first.year}-${String(first.month).padStart(2, "0")}-01`, end: toIsoDate(today) } };
}

/** One series per dashboard, named and coloured by the registry; months with no data are null. */
export function pivotMonthly(rows: ActiveUsersMonth[], months: { year: number; month: number }[]): ChartModel {
  const series = usageRegistry()
    .filter((d) => rows.some((r) => r.dashboard === d.id))
    .map((d) => ({
      name: d.name,
      color: d.color,
      type: "line" as const,
      data: months.map((m) => {
        const row = rows.find((r) => r.dashboard === d.id && r.year === m.year && r.month === m.month);
        return row ? row.active_users : null;
      }),
    }));
  return { labels: months.map((m) => monthLabel(m.year, m.month)), series };
}

/** Active users not seen for `days` days; blocked users do not count and a user who never signed in does. */
export function countInactiveUsers(users: { banned: boolean; lastActiveAt: number | null }[], days: number, now: number = Date.now()): number {
  const cutoff = now - days * 86_400_000;
  return users.filter((u) => !u.banned && (u.lastActiveAt === null || u.lastActiveAt < cutoff)).length;
}

export function displayName(userId: string, users: ResolvedUsers): string {
  const found = users[userId];
  return found?.name || found?.email || USER_REMOVED;
}

export const emptyMessage = (what: string) =>
  `Sem ${what} no período seleccionado. Os dados de utilização cobrem apenas o período desde o início do acompanhamento.`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Hoje", "Ontem", "Há 3 dias", then the date. */
export function relativeDay(iso: string | null | undefined, now: Date = new Date()): string {
  const when = iso ? new Date(iso) : null;
  if (!when || Number.isNaN(when.getTime())) return "–";
  const days = Math.round((startOfDay(now) - startOfDay(when)) / 86_400_000);
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 30) return `Há ${days} dias`;
  return `${String(when.getDate()).padStart(2, "0")} ${PT_MONTHS_SHORT[when.getMonth()]} ${when.getFullYear()}`;
}

/** Date and time for the patient-data log, e.g. "05 Nov 2026, 14:32". */
export function formatDateTime(iso: string | null | undefined): string {
  const when = iso ? new Date(iso) : null;
  if (!when || Number.isNaN(when.getTime())) return "–";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(when.getDate())} ${PT_MONTHS_SHORT[when.getMonth()]} ${when.getFullYear()}, ${p(when.getHours())}:${p(when.getMinutes())}`;
}

export const formatDecimal = (value: number) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

/** Resolves user ids through `resolve`, deduplicated and at most 100 per call (the action's cap). */
export async function resolveInChunks(
  ids: string[],
  resolve: (chunk: string[]) => Promise<ResolvedUsers>,
): Promise<ResolvedUsers> {
  const unique = [...new Set(ids)];
  const out: ResolvedUsers = {};
  for (let i = 0; i < unique.length; i += MAX_IDS) Object.assign(out, await resolve(unique.slice(i, i + MAX_IDS)));
  return out;
}

/** "1 284": counts grouped like the other dashboards (narrow no-break space, four digits included). */
export const formatCount = (value: number): string => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
