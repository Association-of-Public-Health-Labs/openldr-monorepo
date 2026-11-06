import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { KpiTrend } from "@repo/design_system/app/organisms/cards/KpiCard";
import { usageGet } from "@/lib/admin/usage-api";
import { formatDecimal, trendVsPrevious, type UsageFilters, type UsageSummary, formatCount } from "@/lib/admin/usage";
import { countInactive } from "@/app/(dashboard)/users/actions";
import { ENDPOINT, INACTIVE_DAYS } from "./constants";

export type KpiData = { summary: UsageSummary; /** null when counting users failed; the other tiles still show. */ inactive: number | null };

export async function fetchData(filters: UsageFilters, token: string | null): Promise<KpiData> {
  const [summary, inactive] = await Promise.all([
    usageGet<UsageSummary>(ENDPOINT, { interval_dates: intervalParam(filters.range), dashboard: filters.dashboard }, token),
    countInactive(INACTIVE_DAYS).catch(() => null),
  ]);
  return { summary, inactive };
}

export type TileKey = "active" | "sessions" | "perUser" | "inactive";
export type Tile = { key: TileKey; value: string; trend: KpiTrend | null; subtitle: string };

export function toTiles({ summary, inactive }: KpiData, period: string): Tile[] {
  return [
    { key: "active", value: formatCount(summary.active_users), trend: trendVsPrevious(summary.active_users, summary.previous?.active_users), subtitle: period },
    { key: "sessions", value: formatCount(summary.sessions), trend: trendVsPrevious(summary.sessions, summary.previous?.sessions), subtitle: period },
    { key: "perUser", value: formatDecimal(summary.sessions_per_user), trend: null, subtitle: "média no período" },
    {
      key: "inactive",
      value: inactive === null ? "–" : formatCount(inactive),
      trend: null,
      subtitle: `sem acesso há mais de ${INACTIVE_DAYS} dias`,
    },
  ];
}
