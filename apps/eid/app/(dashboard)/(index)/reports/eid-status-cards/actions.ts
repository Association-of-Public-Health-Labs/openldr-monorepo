import { eidGetList } from "@/lib/eid/api";
import type { IndicatorsByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import { completeMonths, num, pct, sum, type MonthPair } from "@repo/design_system/lib/report/format";
import { ENDPOINT } from "./constants";

export type Tile = { title: string; value: number; percent: string; labels: string[]; data: number[]; trend: MonthPair | null };

// No lab_type: the default request hits the API cache seeds.
export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<IndicatorsByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

const TILES: { title: string; key: "registered" | "tested" | "rejected" }[] = [
  { title: "Total de Amostras", key: "registered" },
  { title: "Amostras Registadas", key: "registered" },
  { title: "Amostras Testadas", key: "tested" },
  { title: "Amostras Rejeitadas", key: "rejected" },
];

/** Ruling E1: sums over the months; the percent is the share of registered (whole numbers, as the legacy). */
export function toTiles(rows: IndicatorsByMonth[], today = new Date()): Tile[] {
  const registered = sum(rows.map((r) => r.registered));
  const labels = rows.map((r) => monthLabel(r.year, r.month));
  return TILES.map(({ title, key }) => {
    const data = rows.map((r) => num(r[key]));
    const value = sum(data);
    return {
      title,
      value,
      percent: `${key === "registered" ? (registered > 0 ? 100 : 0) : pct(value, registered)}%`,
      labels,
      data,
      trend: completeMonths(rows, data, today),
    };
  });
}
