import type { DateRangeStr } from "./types";
const fmt = (d: Date) => d.toISOString().slice(0, 10);
export function getLastTwelveMonths(now: Date = new Date()): DateRangeStr {
  const end = new Date(now); const start = new Date(now); start.setFullYear(start.getFullYear() - 1);
  return { startDate: fmt(start), endDate: fmt(end) };
}
export function rangeFromSearchParams(sp: URLSearchParams): DateRangeStr {
  const s = sp.get("startDate"), e = sp.get("endDate");
  return s && e ? { startDate: s, endDate: e } : getLastTwelveMonths();
}
