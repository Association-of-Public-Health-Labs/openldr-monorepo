/**
 * Data of the Transporte page. Until the API has the transport endpoints, `fetchTransport` builds
 * demonstration data (deterministic: the same week and place always give the same figures), in
 * the shape the API is expected to return. Replacing the body of `fetchTransport` with the API
 * call is the only change the page will need.
 */
import type { Week, WeekRange } from "@repo/design_system/lib/weeks";
import { DISTRICT_CODES, PROVINCE_NAMES } from "@/lib/vl/districts";
import { addCounts, EMPTY, type TatCounts } from "./tat";

/** Shown on the page while the figures are not real. */
export const DEMO_DATA = true;

export type TatUnit = { name: string; counts: TatCounts; /** Samples without a collection date. */ noDate: number };

export type ChildLevel = "province" | "district" | "facility";

export type TransportQuery = { range: WeekRange; province: string | null; district: string | null };

export type TransportView = {
  /** Moçambique, the province or the district being viewed. */
  area: TatUnit;
  /** Its provinces, districts or health facilities. */
  children: TatUnit[];
  childLevel: ChildLevel;
  /** The areas on the map: provinces (national view), else the province's districts (a district included). */
  mapUnits: TatUnit[];
  /** The area, week by week (all the weeks of the picker). */
  weekly: TatCounts[];
  /** The country, week by week (the picker's mini bars). */
  nationalWeekly: TatCounts[];
};

export const NATIONAL = "Moçambique";

// ------------------------------------------------------------------ demonstration data

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: string) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// How a district's samples spread over the intervals, by performance tier (0 strong … 3 critical).
const TIER_WEIGHTS = [
  [6, 3, 1, 0.4],
  [3, 4, 1.6, 0.8],
  [1.2, 2.4, 3, 2.2],
  [0.6, 1.4, 2.4, 4],
];

type Cell = { counts: TatCounts; noDate: number };
const cells = new Map<string, Cell>();

/** One district, one week (keyed by the week's Monday, so a week keeps its figures as time moves on). */
function districtWeek(province: string, district: string, week: Week): Cell {
  const key = `${province}|${district}|${week.start}`;
  const hit = cells.get(key);
  if (hit) return hit;
  const r = random(key);
  const tier = hash(`${province}|${district}`) % 4;
  let total = Math.round(4 + r() * 26);
  if (r() < 0.05) total = 0; // a few weeks without samples
  const counts: TatCounts = [0, 0, 0, 0];
  const w = TIER_WEIGHTS[tier];
  const sum = w[0] + w[1] + w[2] + w[3];
  for (let i = 0; i < total; i++) {
    let x = r() * sum;
    let k = 0;
    while (k < 3 && x > w[k]) x -= w[k++];
    counts[k]++;
  }
  const cell = { counts, noDate: r() < 0.2 ? Math.round(r() * 2) : 0 };
  cells.set(key, cell);
  return cell;
}

const districtsOf = (province: string) => [...new Set(Object.values(DISTRICT_CODES[province] ?? {}))];

function facilitiesOf(district: string): string[] {
  const suffixes = ["Sede", "Vila", "Norte", "Posto", "Missão", "Rio", "Central", "Velha"];
  const n = 3 + (hash(district) % 5);
  return [`CS ${district}`, ...suffixes.slice(0, n).map((s) => `CS ${district} ${s}`)];
}

function sumCells(list: Cell[]): Cell {
  return list.reduce((acc, c) => ({ counts: addCounts(acc.counts, c.counts), noDate: acc.noDate + c.noDate }), { counts: EMPTY, noDate: 0 });
}

const inRange = (weeks: Week[], range: WeekRange) => weeks.slice(range.from, range.to + 1);

function districtUnit(province: string, district: string, weeks: Week[]): Cell {
  return sumCells(weeks.map((w) => districtWeek(province, district, w)));
}

function provinceCell(province: string, weeks: Week[]): Cell {
  return sumCells(districtsOf(province).map((d) => districtUnit(province, d, weeks)));
}

/** A district's samples shared out over its facilities (stable for a given week). */
function facilityUnits(province: string, district: string, weeks: Week[]): TatUnit[] {
  const names = facilitiesOf(district);
  const totals = names.map(() => ({ counts: [0, 0, 0, 0] as TatCounts, noDate: 0 }));
  for (const week of weeks) {
    const cell = districtWeek(province, district, week);
    const r = random(`facilities|${district}|${week.start}`);
    cell.counts.forEach((n, k) => {
      for (let i = 0; i < n; i++) totals[Math.floor(r() * names.length)].counts[k]++;
    });
    for (let i = 0; i < cell.noDate; i++) totals[Math.floor(r() * names.length)].noDate++;
  }
  return names.map((name, i) => ({ name, ...totals[i] }));
}

export function buildDemo(weeks: Week[], query: TransportQuery): TransportView {
  const period = inRange(weeks, query.range);
  const nationalWeekly = weeks.map((w) => sumCells(PROVINCE_NAMES.map((p) => provinceCell(p, [w]))).counts);

  if (query.province && query.district) {
    const { province, district } = query;
    return {
      area: { name: district, ...districtUnit(province, district, period) },
      children: facilityUnits(province, district, period),
      childLevel: "facility",
      mapUnits: districtsOf(province).map((d) => ({ name: d, ...districtUnit(province, d, period) })),
      weekly: weeks.map((w) => districtWeek(province, district, w).counts),
      nationalWeekly,
    };
  }
  if (query.province) {
    const { province } = query;
    const districts = districtsOf(province).map((d) => ({ name: d, ...districtUnit(province, d, period) }));
    return {
      area: { name: province, ...provinceCell(province, period) },
      children: districts,
      childLevel: "district",
      mapUnits: districts,
      weekly: weeks.map((w) => provinceCell(province, [w]).counts),
      nationalWeekly,
    };
  }
  const provinces = PROVINCE_NAMES.map((p) => ({ name: p, ...provinceCell(p, period) }));
  return {
    area: { name: NATIONAL, ...sumCells(provinces) },
    children: provinces,
    childLevel: "province",
    mapUnits: provinces,
    weekly: nationalWeekly,
    nationalWeekly,
  };
}

/** The view for a period and place. Demonstration data for now (see the top of this file). */
export async function fetchTransport(weeks: Week[], query: TransportQuery): Promise<TransportView> {
  // A short wait, so the loading states are seen as they will be with the API.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return buildDemo(weeks, query);
}
