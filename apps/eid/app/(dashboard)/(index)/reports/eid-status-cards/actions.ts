import { eidGetList } from "@/lib/eid/api";
import type { IndicatorsByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import { completeMonths, num, pct, sum, type MonthPair } from "@repo/design_system/lib/report/format";
import { kpiDocs, kpiFigures, kpiSheet, type KpiFigure } from "@repo/design_system/lib/report/kpi-detail";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { ENDPOINT } from "./constants";
import { DOCS, type TileId } from "./docs";

export type Tile = { id: TileId; key: "registered" | "tested" | "rejected"; title: string; value: number; percent: string; labels: string[]; data: number[]; trend: MonthPair | null };

// No lab_type: the default request hits the API cache seeds.
export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<IndicatorsByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

const TILES: { id: TileId; title: string; key: "registered" | "tested" | "rejected" }[] = [
  { id: "total", title: "Total de Amostras", key: "registered" },
  { id: "registered", title: "Amostras Registadas", key: "registered" },
  { id: "tested", title: "Amostras Testadas", key: "tested" },
  { id: "rejected", title: "Amostras Rejeitadas", key: "rejected" },
];

/** Ruling E1: sums over the months; the percent is the share of registered (whole numbers, as the legacy). */
export function toTiles(rows: IndicatorsByMonth[], today = new Date()): Tile[] {
  const registered = sum(rows.map((r) => r.registered));
  const labels = rows.map((r) => monthLabel(r.year, r.month));
  return TILES.map(({ id, title, key }) => {
    const data = rows.map((r) => num(r[key]));
    const value = sum(data);
    return {
      id,
      key,
      title,
      value,
      percent: `${key === "registered" ? (registered > 0 ? 100 : 0) : pct(value, registered)}%`,
      labels,
      data,
      trend: completeMonths(rows, data, today),
    };
  });
}

const SHARE = "% das registadas";

/** The drawer's figures, Excel sheet and docs for one tile, from the rows the tiles already have. */
export function tileDetail(
  tile: Tile,
  rows: IndicatorsByMonth[],
  /** The tile's number format. */
  format: (v: number) => string,
  start: string,
  today = new Date(),
): { figures: KpiFigure[]; sheet: ExcelSheet; docs: string[] } {
  const base = rows.map((r) => num(r.registered));
  // Tested and rejected read as a share of registered, as the tile's subtitle.
  const shared = tile.key !== "registered";
  const figures = kpiFigures(
    { kind: "count", months: rows, data: tile.data, value: tile.value, trend: tile.trend, format, start, share: shared ? { label: SHARE, base } : undefined },
    today,
  );
  const extra = shared ? [{ header: SHARE, values: tile.data.map((v, i) => pct(v, base[i])) }] : [];
  return { figures, sheet: kpiSheet(tile.title, tile.labels, tile.data, extra), docs: kpiDocs("count", [...DOCS[tile.id]]) };
}
