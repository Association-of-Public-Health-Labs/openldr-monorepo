/** Card subtitle for the default period of every report. */
export const LAST_12_MONTHS_LABEL = "Últimos 12 meses";

const DAY = 86_400_000;

/** "2026-10-19" (or an ISO date-time) → days since the epoch, read as written, without timezone shifts. */
function dayNumber(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY : null;
}

const localDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;

/** The windows the dashboards call "last 12 months", ending on `end` (a UTC day number). */
function twelveMonthStarts(end: number): number[] {
  const e = new Date(end * DAY);
  const y = e.getUTCFullYear();
  const m = e.getUTCMonth();
  const d = e.getUTCDate();
  // Same day a year before (29 Feb → 28 Feb).
  const lastDay = new Date(Date.UTC(y - 1, m + 1, 0)).getUTCDate();
  const sameDay = Date.UTC(y - 1, m, Math.min(d, lastDay)) / DAY;
  // First day of the month 11 months before: twelve calendar months including the current one.
  const monthStart = Date.UTC(y, m - 11, 1) / DAY;
  return [sameDay, monthStart];
}

/**
 * Whether a report's period is its default "last 12 months": it ends today and starts either the same day
 * a year before or on the 1st of the month 11 months before (the two windows the reports use). One day of
 * slack on both ends: some reports build their dates with toISOString(), which is UTC, a day behind
 * Mozambique (UTC+2) just after midnight.
 */
export function isLastTwelveMonths(start: string, end: string, today: Date = new Date()): boolean {
  const s = dayNumber(start);
  const e = dayNumber(end);
  if (s === null || e === null) return false;
  const t = localDay(today);
  if (Math.abs(e - t) > 1) return false;
  return [e, t].some((anchor) => twelveMonthStarts(anchor).some((c) => Math.abs(s - c) <= 1));
}

/** "Últimos 12 meses" for the default period, otherwise the report's own formatting of the dates. */
export function periodLabel(start: string, end: string, formatRange: (start: string, end: string) => string, today?: Date): string {
  return isLastTwelveMonths(start, end, today) ? LAST_12_MONTHS_LABEL : formatRange(start, end);
}
