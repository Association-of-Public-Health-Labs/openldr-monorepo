import type { Host, HostType, CategorySummary, NationalSummary, RegionConnectivity, DateRangeStr, GroupedStat } from "./types";

export const PROVINCE_CODE: Record<string, string> = {
  "Maputo Cidade": "mc", "Maputo Provincia": "mp", "Maputo Província": "mp",
  "Gaza": "gz", "Inhambane": "ib", "Manica": "mn", "Sofala": "sf",
  "Tete": "tt", "Zambezia": "zb", "Zambézia": "zb", "Nampula": "np",
  "Niassa": "ns", "Cabo Delgado": "cd",
};

const WORK_START_H = 8, WORK_END_H = 16; // 08:00–16:00 UTC, Mon–Fri
export function workingMinutes(range: DateRangeStr): number {
  const perDay = (WORK_END_H - WORK_START_H) * 60;
  let total = 0;
  const to = new Date(`${range.endDate}T00:00:00Z`).getTime();
  for (let t = new Date(`${range.startDate}T00:00:00Z`).getTime(); t <= to; t += 86_400_000) {
    const dow = new Date(t).getUTCDay(); // 0 Sun … 6 Sat
    if (dow !== 0 && dow !== 6) total += perDay;
  }
  return total;
}

export function countByCategory(hosts: Host[], type: HostType | "all") {
  const scoped = type === "all" ? hosts : hosts.filter(h => h.type === type);
  const offline = scoped.filter(h => h.status === "Offline").length;
  return { total: scoped.length, online: scoped.length - offline, offline };
}

const LABELS: Record<HostType | "all", string> = {
  all: "Todos os sites", Disalab: "Disalab", Disapoc: "DisaPoC", Disalink: "DisaLink",
};

export function categorySummary(
  hosts: Host[], type: HostType | "all", offlineMinutes: number, range: DateRangeStr, trend: number[] = []
): CategorySummary {
  const { total, online, offline } = countByCategory(hosts, type);
  const capacity = workingMinutes(range) * total;
  const downtimePct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((offlineMinutes / capacity) * 100))) : 0;
  return { type, label: LABELS[type], total, online, offline, downtimePct, trend };
}

export function nationalSummary(
  hosts: Host[], offlineMinutesByCategory: Record<HostType | "all", number>, range: DateRangeStr
): NationalSummary {
  const categories: CategorySummary[] = (["all", "Disalab", "Disapoc", "Disalink"] as const).map(t =>
    categorySummary(hosts, t, offlineMinutesByCategory[t] ?? 0, range));
  const all = categories[0];
  return { categories, downtimePct: all.downtimePct, uptimePct: 100 - all.downtimePct };
}

export function regionUptime(
  hosts: Host[], keyOf: (host: Host) => string | null,
  offlineMinutesByRegion: Record<string, number>, range: DateRangeStr
): RegionConnectivity[] {
  const byRegion = new Map<string, Host[]>();
  for (const h of hosts) {
    const name = keyOf(h);
    if (!name) continue;
    const list = byRegion.get(name);
    if (list) list.push(h);
    else byRegion.set(name, [h]);
  }
  const perHostCap = workingMinutes(range);
  return [...byRegion.entries()].map(([name, list]) => {
    const cap = perHostCap * list.length;
    const off = offlineMinutesByRegion[name] ?? 0;
    const uptimePct = cap > 0 ? Math.max(0, Math.min(100, Math.round(100 * (1 - off / cap)))) : 100;
    return { name, code: PROVINCE_CODE[name], uptimePct, hostCount: list.length };
  });
}

/** DisaStatus grouped offline minutes, summed under `keyOf(name)`; names without a key are dropped. */
export function offlineByKey(
  stats: GroupedStat[], field: "province" | "district", keyOf: (name: string | null) => string | null
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of stats) {
    const key = keyOf(s[field] ?? null);
    if (key) out[key] = (out[key] ?? 0) + (s.amount_of_time || 0);
  }
  return out;
}
