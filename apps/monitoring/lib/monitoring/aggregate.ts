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

/** Whole days in the range (inclusive), for Disalab's round-the-clock capacity. */
function dayCount(range: DateRangeStr): number {
  const from = Date.parse(`${range.startDate}T00:00:00Z`), to = Date.parse(`${range.endDate}T00:00:00Z`);
  return to >= from ? Math.round((to - from) / 86_400_000) + 1 : 0;
}

/**
 * Minutes a host of `type` can be offline in the range, matching how DisaStatus counts outages
 * (prisma-internetConnectivityLogs-repository, dev @15a74f6): Disalab outages in full, around the clock;
 * DisaPoC/DisaLink ones only within working hours. Hosts of no known type get no minutes from
 * DisaStatus, so they add no capacity either.
 */
export function capacityMinutes(type: HostType | null, range: DateRangeStr): number {
  if (type === "Disalab") return dayCount(range) * 24 * 60;
  if (type === "Disapoc" || type === "Disalink") return workingMinutes(range);
  return 0;
}

const capacityOf = (hosts: Host[], range: DateRangeStr) =>
  hosts.reduce((sum, h) => sum + capacityMinutes(h.type, range), 0);

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
  const scoped = type === "all" ? hosts : hosts.filter(h => h.type === type);
  const capacity = capacityOf(scoped, range);
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
  return [...byRegion.entries()].map(([name, list]) => {
    const cap = capacityOf(list, range);
    const off = offlineMinutesByRegion[name] ?? 0;
    const uptimePct = cap > 0 ? Math.max(0, Math.min(100, Math.round(100 * (1 - off / cap)))) : 100;
    return { name, code: PROVINCE_CODE[name], uptimePct, hostCount: list.length };
  });
}

/**
 * Per-site offline minutes (keyed by site name, as DisaStatus returns them) summed under each
 * site's group. A name counts once per group: DisaStatus already merges sites that share a name.
 */
export function offlineByHostGroup(
  hosts: Host[], minutesByName: Record<string, number>, keyOf: (host: Host) => string | null
): Record<string, number> {
  const seen = new Set<string>();
  const out: Record<string, number> = {};
  for (const h of hosts) {
    const key = keyOf(h);
    if (!key || !h.name || seen.has(`${key}\u0000${h.name}`)) continue;
    seen.add(`${key}\u0000${h.name}`);
    const minutes = minutesByName[h.name];
    if (minutes) out[key] = (out[key] ?? 0) + minutes;
  }
  return out;
}
