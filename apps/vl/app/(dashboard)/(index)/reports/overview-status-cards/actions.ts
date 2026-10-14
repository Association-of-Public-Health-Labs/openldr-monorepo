import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import { mean, num, pct, sum } from "@/lib/vl/format";
import type { SamplesByMonth, SuppressionByMonth, TatByMonth } from "@/lib/vl/types";
import { ENDPOINTS } from "./constants";

export type Overview = { samples: SamplesByMonth[]; suppression: SuppressionByMonth[]; tat: TatByMonth[] };
export type Tile = { value: number; labels: string[]; data: number[] };

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
export function summarize(o: Overview): { samples: Tile; suppression: Tile; tat: Tile } {
  const label = (r: { year: number; month: number }) => monthLabel(r.year, r.month);
  const suppressionPct = o.suppression.map((r) => pct(r.suppressed, r.total));
  const tatSums = o.tat.map(
    (r) => num(r.collection_reception) + num(r.reception_registration) + num(r.registration_analysis) + num(r.analysis_validation),
  );
  return {
    samples: { value: sum(o.samples.map((r) => r.total)), labels: o.samples.map(label), data: o.samples.map((r) => num(r.total)) },
    suppression: { value: Math.round(mean(suppressionPct)), labels: o.suppression.map(label), data: suppressionPct },
    tat: { value: Math.round(mean(tatSums)), labels: o.tat.map(label), data: tatSums },
  };
}
