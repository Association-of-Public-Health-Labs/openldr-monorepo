import { vlGetList } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import { completeMonths, mean, num, pct, sum, type MonthPair } from "@repo/design_system/lib/report/format";
import { kpiDocs, kpiFigures, kpiSheet, type KpiFigure, type KpiKind } from "@repo/design_system/lib/report/kpi-detail";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import type { RejectedByMonth, SamplesByMonth, SuppressionByMonth, TatByMonth } from "@/lib/vl/types";
import { ENDPOINTS } from "./constants";
import { DOCS } from "./docs";

export type Overview = { samples: SamplesByMonth[]; suppression: SuppressionByMonth[]; tat: TatByMonth[]; rejected: RejectedByMonth[] };
export type TileKey = "samples" | "suppression" | "tat" | "rejected";
export type Tile = { value: number; labels: string[]; data: number[]; trend: MonthPair | null };

export async function fetchOverview(range: DateRange, token: string | null): Promise<Overview> {
  const params = { interval_dates: intervalParam(range) };
  const [samples, suppression, tat, rejected] = await Promise.all([
    vlGetList<SamplesByMonth>(ENDPOINTS.samples, params, token),
    vlGetList<SuppressionByMonth>(ENDPOINTS.suppression, params, token),
    vlGetList<TatByMonth>(ENDPOINTS.tat, params, token),
    vlGetList<RejectedByMonth>(ENDPOINTS.rejected, params, token),
  ]);
  return { samples, suppression, tat, rejected };
}

/** Ruling P13: legacy maths. */
export function summarize(o: Overview, today = new Date()): { samples: Tile; suppression: Tile; tat: Tile; rejected: Tile } {
  const label = (r: { year: number; month: number }) => monthLabel(r.year, r.month);
  const suppressionPct = o.suppression.map((r) => pct(r.suppressed, r.total));
  const tatSums = o.tat.map(
    (r) => num(r.collection_reception) + num(r.reception_registration) + num(r.registration_analysis) + num(r.analysis_validation),
  );
  // Unrounded for the trend: a change of a few tenths of a point still shows.
  const suppressionExact = o.suppression.map((r) => (num(r.total) > 0 ? (100 * num(r.suppressed)) / num(r.total) : 0));
  const samples = o.samples.map((r) => num(r.total));
  const rejected = o.rejected.map((r) => num(r.total));
  return {
    samples: { value: sum(samples), labels: o.samples.map(label), data: samples, trend: completeMonths(o.samples, samples, today) },
    suppression: {
      value: Math.round(mean(suppressionPct)),
      labels: o.suppression.map(label),
      data: suppressionPct,
      trend: completeMonths(o.suppression, suppressionExact, today),
    },
    tat: { value: Math.round(mean(tatSums)), labels: o.tat.map(label), data: tatSums, trend: completeMonths(o.tat, tatSums, today) },
    rejected: { value: sum(rejected), labels: o.rejected.map(label), data: rejected, trend: completeMonths(o.rejected, rejected, today) },
  };
}

/** Floor for a rate's bars: a step of 5 below the lowest month, so month-to-month changes show. */
export const rateFloor = (data: number[]): number | undefined => {
  const lows = data.filter((v) => v > 0);
  return lows.length ? Math.max(0, Math.floor((Math.min(...lows) - 5) / 5) * 5) : undefined;
};

/** What each tile measures and its Excel column. */
export const TILE_KIND: Record<TileKey, { kind: KpiKind; header: string }> = {
  samples: { kind: "count", header: "Número de amostras" },
  suppression: { kind: "rate", header: "Supressão viral (%)" },
  tat: { kind: "days", header: "Tempo de resposta (dias)" },
  rejected: { kind: "count", header: "Amostras rejeitadas" },
};

/** The drawer's figures, Excel sheet and docs for one tile, from the data the tile already has. */
export function tileDetail(
  key: TileKey,
  o: Overview,
  tile: Tile,
  /** The tile's number format. */
  format: (v: number) => string,
  start: string,
  today = new Date(),
): { figures: KpiFigure[]; sheet: ExcelSheet; docs: string[] } {
  const { kind, header } = TILE_KIND[key];
  const figures = kpiFigures({ kind, months: o[key], data: tile.data, value: tile.value, trend: tile.trend, format, start }, today);
  const extra =
    key === "suppression"
      ? [
          { header: "Amostras com resultado", values: o.suppression.map((r) => num(r.total)) },
          { header: "Suprimidas", values: o.suppression.map((r) => num(r.suppressed)) },
          { header: "Não suprimidas", values: o.suppression.map((r) => num(r.not_suppressed)) },
        ]
      : [];
  return { figures, sheet: kpiSheet(header, tile.labels, tile.data, extra), docs: kpiDocs(kind, [...DOCS[key]]) };
}
