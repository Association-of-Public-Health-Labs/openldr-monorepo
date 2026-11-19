import type { ConnectivityLog, DateRangeStr, HeatmapCell } from "./types";

const DAY_MS = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The site's outages as sorted, non-overlapping [start, end) spans. The poller often logs the same
 * outage several times (2–18 copies), so the copies are merged before anything is counted;
 * summing them made some days look far worse than they were. An open outage runs to `openEnd`.
 */
function mergedOutages(logs: ConnectivityLog[], openEnd: number): [number, number][] {
  const spans = logs
    .filter((l) => l.start_date)
    .map((l): [number, number] => [new Date(l.start_date as string).getTime(), l.end_date ? new Date(l.end_date).getTime() : openEnd])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [s, e] of spans) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}

export function buildHeatmap(logs: ConnectivityLog[], range: DateRangeStr, hostCreatedAt: string): HeatmapCell[] {
  const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
  const created = hostCreatedAt ? new Date(hostCreatedAt).getTime() : start;
  const from = Math.max(start, isNaN(created) ? start : new Date(dayKey(new Date(created)) + "T00:00:00Z").getTime());
  const to = new Date(`${range.endDate}T00:00:00Z`).getTime();
  const outages = mergedOutages(logs, to + DAY_MS);

  const cells: HeatmapCell[] = [];
  for (let t = from; t <= to; t += DAY_MS) {
    const dayStart = t, dayEnd = t + DAY_MS;
    let offline = 0;
    for (const [s, e] of outages) {
      if (s >= dayEnd) break;
      const overlap = Math.min(e, dayEnd) - Math.max(s, dayStart);
      if (overlap > 0) offline += overlap;
    }
    const uptime = Math.max(0, Math.min(100, Math.round(100 * (1 - offline / DAY_MS))));
    cells.push({ date: dayKey(new Date(t)), uptime });
  }
  return cells;
}

export interface HeatmapStats {
  /** Days fully online. */
  clean: number;
  /** Days with some time offline. */
  partial: number;
  /** Days fully offline. */
  offline: number;
  /** Longest run of consecutive fully offline days. */
  longestOffline: number;
}

/** The indicators under the daily chart. */
export function heatmapStats(cells: HeatmapCell[]): HeatmapStats {
  let clean = 0, partial = 0, offline = 0, run = 0, longestOffline = 0;
  for (const c of cells) {
    if (c.uptime >= 100) clean++;
    else if (c.uptime <= 0) offline++;
    else partial++;
    run = c.uptime <= 0 ? run + 1 : 0;
    longestOffline = Math.max(longestOffline, run);
  }
  return { clean, partial, offline, longestOffline };
}
