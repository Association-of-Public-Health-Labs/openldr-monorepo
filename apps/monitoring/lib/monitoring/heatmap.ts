import type { ConnectivityLog, DateRangeStr, HeatmapCell } from "./types";

const DAY_MS = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function buildHeatmap(logs: ConnectivityLog[], range: DateRangeStr, hostCreatedAt: string): HeatmapCell[] {
  const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
  const created = hostCreatedAt ? new Date(hostCreatedAt).getTime() : start;
  const from = Math.max(start, isNaN(created) ? start : new Date(dayKey(new Date(created)) + "T00:00:00Z").getTime());
  const to = new Date(`${range.endDate}T00:00:00Z`).getTime();

  const cells: HeatmapCell[] = [];
  for (let t = from; t <= to; t += DAY_MS) {
    const dayStart = t, dayEnd = t + DAY_MS;
    let offline = 0;
    for (const log of logs) {
      if (!log.start_date) continue;
      const s = new Date(log.start_date).getTime();
      const e = log.end_date ? new Date(log.end_date).getTime() : dayEnd;
      const overlap = Math.min(e, dayEnd) - Math.max(s, dayStart);
      if (overlap > 0) offline += overlap;
    }
    const uptime = Math.max(0, Math.min(100, Math.round(100 * (1 - offline / DAY_MS))));
    cells.push({ date: dayKey(new Date(t)), uptime });
  }
  return cells;
}
