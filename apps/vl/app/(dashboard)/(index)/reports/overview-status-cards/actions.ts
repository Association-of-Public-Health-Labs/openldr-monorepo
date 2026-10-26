import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import { mean, num, pct, sum } from "@repo/design_system/lib/report/format";
import type { SamplesByMonth, SuppressionByMonth, TatByMonth } from "@/lib/vl/types";
import { ENDPOINTS } from "./constants";

export type Overview = { samples: SamplesByMonth[]; suppression: SuppressionByMonth[]; tat: TatByMonth[] };
/** The last complete month and the one before it, for the trend under the value. */
export type MonthPair = { previous: number; last: number; /** Position of the last complete month. */ index: number };
export type Tile = { value: number; labels: string[]; data: number[]; trend: MonthPair | null };

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

export async function fetchOverview(range: DateRange, token: string | null): Promise<Overview> {
  const params = { interval_dates: intervalParam(range) };
  const [samples, suppression, tat] = await Promise.all([
    vlGetList<SamplesByMonth>(ENDPOINTS.samples, params, token),
    vlGetList<SuppressionByMonth>(ENDPOINTS.suppression, params, token),
    vlGetList<TatByMonth>(ENDPOINTS.tat, params, token),
  ]);
  return { samples, suppression, tat };
}

/** Ruling P13: legacy maths. */
export function summarize(o: Overview, today = new Date()): { samples: Tile; suppression: Tile; tat: Tile } {
  const label = (r: { year: number; month: number }) => monthLabel(r.year, r.month);
  const suppressionPct = o.suppression.map((r) => pct(r.suppressed, r.total));
  const tatSums = o.tat.map(
    (r) => num(r.collection_reception) + num(r.reception_registration) + num(r.registration_analysis) + num(r.analysis_validation),
  );
  // Unrounded for the trend: a change of a few tenths of a point still shows.
  const suppressionExact = o.suppression.map((r) => (num(r.total) > 0 ? (100 * num(r.suppressed)) / num(r.total) : 0));
  const samples = o.samples.map((r) => num(r.total));
  return {
    samples: { value: sum(samples), labels: o.samples.map(label), data: samples, trend: completeMonths(o.samples, samples, today) },
    suppression: {
      value: Math.round(mean(suppressionPct)),
      labels: o.suppression.map(label),
      data: suppressionPct,
      trend: completeMonths(o.suppression, suppressionExact, today),
    },
    tat: { value: Math.round(mean(tatSums)), labels: o.tat.map(label), data: tatSums, trend: completeMonths(o.tat, tatSums, today) },
  };
}

export type TrendKind = "percent" | "points" | "days";

const MINUS = "\u2212";
const signed = (n: number, digits: number) => `${n < 0 ? MINUS : "+"}${Math.abs(n).toFixed(digits)}`;

/**
 * How the last complete month moved against the one before: samples in %, suppression in
 * percentage points, turnaround in days (where going down is the good news).
 */
export function trendOf(pair: Pick<MonthPair, "previous" | "last"> | null, kind: TrendKind) {
  if (!pair) return null;
  const diff = pair.last - pair.previous;
  if (kind === "percent" && pair.previous === 0) return null;
  const value =
    kind === "percent" ? `${signed((100 * diff) / pair.previous, 1)}%` : kind === "points" ? `${signed(diff, 1)} p.p.` : `${signed(diff, 1)} dias`;
  const direction: "up" | "down" = diff < 0 ? "down" : "up";
  return { value, direction, good: kind === "days" ? diff <= 0 : diff >= 0, caption: "vs mês anterior" };
}

/** Floor for a rate's bars: a step of 5 below the lowest month, so month-to-month changes show. */
export const rateFloor = (data: number[]): number | undefined => {
  const lows = data.filter((v) => v > 0);
  return lows.length ? Math.max(0, Math.floor((Math.min(...lows) - 5) / 5) * 5) : undefined;
};
