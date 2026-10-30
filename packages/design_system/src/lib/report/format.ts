export const num = (value: number | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const sum = (values: (number | null | undefined)[]): number => values.reduce<number>((acc, v) => acc + num(v), 0);

export const mean = (values: (number | null | undefined)[]): number => (values.length ? sum(values) / values.length : 0);

/** round(part / total × 100), 0 when total is 0 or missing. */
export const pct = (part: number | null | undefined, total: number | null | undefined): number =>
  num(total) > 0 ? Math.round((num(part) / num(total)) * 100) : 0;

/** The last complete month and the one before it, for the trend under the value. */
export type MonthPair = { previous: number; last: number; /** Position of the last complete month. */ index: number };

type Month = { year: number; month: number };

/**
 * The last two complete months: the current month is still filling up, so comparing it would
 * always look like a drop. Null with fewer than two.
 */
export function completeMonths(rows: Month[], values: number[], today = new Date()): MonthPair | null {
  const current = today.getFullYear() * 12 + today.getMonth() + 1;
  const done = values.map((value, index) => ({ value, index })).filter(({ index }) => rows[index].year * 12 + rows[index].month < current);
  if (done.length < 2) return null;
  const [previous, last] = done.slice(-2);
  return { previous: previous.value, last: last.value, index: last.index };
}

export type TrendKind = "percent" | "points" | "days";

const MINUS = "\u2212";
const signed = (n: number, digits: number) => `${n < 0 ? MINUS : "+"}${Math.abs(n).toFixed(digits)}`;

/**
 * How the last complete month moved against the one before: samples in %, suppression in
 * percentage points, turnaround in days (where going down is the good news).
 */
export function trendOf(
  pair: Pick<MonthPair, "previous" | "last"> | null,
  kind: TrendKind,
  /** `lowerIsBetter`: a fall is the good news whatever the kind (rejections). */
  opts?: { lowerIsBetter?: boolean },
) {
  if (!pair) return null;
  const diff = pair.last - pair.previous;
  if (kind === "percent" && pair.previous === 0) return null;
  const value =
    kind === "percent" ? `${signed((100 * diff) / pair.previous, 1)}%` : kind === "points" ? `${signed(diff, 1)} p.p.` : `${signed(diff, 1)} dias`;
  const direction: "up" | "down" = diff < 0 ? "down" : "up";
  return { value, direction, good: opts?.lowerIsBetter || kind === "days" ? diff <= 0 : diff >= 0, caption: "vs mês anterior" };
}
