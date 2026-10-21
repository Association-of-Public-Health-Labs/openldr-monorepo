/**
 * Data of the Transporte page, from the API's transport TAT endpoints
 * (api_openldr_python `/hiv/vl/transport/...`), which read ReportData.VLTransportTATPerWeek, the
 * table behind the weekly CV spreadsheet's "Tempo de Transporte" sheet. Weeks are Sunday to
 * Saturday, as in the spreadsheet; rows for any other window are ignored.
 */
import { isSundayToSaturday, weekRangeParam, type Week, type WeekRange } from "@repo/design_system/lib/weeks";
import { vlGetList, type Params } from "@/lib/vl/api";
import { addCounts, EMPTY, type TatCounts } from "./tat";

export const ENDPOINTS = {
  byLocation: "/transport/tat_by_location/",
  byWeek: "/transport/tat_by_week/",
} as const;

export type TatUnit = {
  name: string;
  counts: TatCounts;
  /** Samples with a collection date but no reception date at the lab. */
  noReceptionDate: number;
};

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

/** A row of either endpoint (place fields as the level asks). */
export type TransportRow = {
  province?: string | null;
  district?: string | null;
  health_facility?: string | null;
  facility_code?: string | null;
  start_date: string;
  end_date: string;
  samples_with_collection_date: number;
  lt_7: number;
  between_7_15: number;
  between_16_21: number;
  gt_21: number;
  no_reception_date: number;
  total_tested: number | null;
  no_collection_date: number | null;
};

const LEVEL_PARAM: Record<ChildLevel, string> = { province: "province", district: "district", facility: "health_facility" };
const NAME_FIELD: Record<ChildLevel, "province" | "district" | "health_facility"> = {
  province: "province",
  district: "district",
  facility: "health_facility",
};

export const toCounts = (row: TransportRow): TatCounts => [
  row.lt_7 || 0,
  row.between_7_15 || 0,
  row.between_16_21 || 0,
  row.gt_21 || 0,
];

/** Places with a name (the table has a few rows with no province or district), one per name. */
export function toUnits(rows: TransportRow[], level: ChildLevel): TatUnit[] {
  const field = NAME_FIELD[level];
  const byName = new Map<string, TatUnit>();
  for (const row of rows) {
    const name = (row[field] ?? "").trim();
    if (!name) continue;
    const seen = byName.get(name);
    byName.set(name, {
      name,
      counts: seen ? addCounts(seen.counts, toCounts(row)) : toCounts(row),
      noReceptionDate: (seen?.noReceptionDate ?? 0) + (row.no_reception_date || 0),
    });
  }
  return [...byName.values()];
}

/** Week rows lined up with the picker's weeks; weeks without a row are empty, non-Sunday–Saturday rows ignored. */
export function alignWeeks(weeks: Week[], rows: TransportRow[]): { counts: TatCounts[]; noReceptionDate: number[] } {
  const byStart = new Map<string, TransportRow>();
  for (const row of rows) {
    if (!isSundayToSaturday(row.start_date, row.end_date)) continue;
    byStart.set(row.start_date.slice(0, 10), row);
  }
  return {
    counts: weeks.map((w) => (byStart.has(w.start) ? toCounts(byStart.get(w.start) as TransportRow) : EMPTY)),
    noReceptionDate: weeks.map((w) => byStart.get(w.start)?.no_reception_date || 0),
  };
}

export const childLevelOf = (query: TransportQuery): ChildLevel =>
  query.district ? "facility" : query.province ? "district" : "province";

/** Place filters of a query, as the API names them. */
const placeParams = (query: TransportQuery): Params => ({
  province: query.province ? [query.province] : undefined,
  district: query.district ? [query.district] : undefined,
});

export type TransportResponses = {
  children: TransportRow[];
  /** The province's districts while a district is open; otherwise the children are the map. */
  map?: TransportRow[];
  weekly: TransportRow[];
  national: TransportRow[];
};

/** The page's view from the endpoints' rows (pure, tested). */
export function buildView(weeks: Week[], query: TransportQuery, responses: TransportResponses): TransportView {
  const childLevel = childLevelOf(query);
  const area = alignWeeks(weeks, responses.weekly);
  const inRange = (values: TatCounts[]) => values.slice(query.range.from, query.range.to + 1).reduce(addCounts, EMPTY);
  const noReception = area.noReceptionDate.slice(query.range.from, query.range.to + 1).reduce((a, b) => a + b, 0);
  const children = toUnits(responses.children, childLevel);
  return {
    area: { name: query.district ?? query.province ?? NATIONAL, counts: inRange(area.counts), noReceptionDate: noReception },
    children,
    childLevel,
    mapUnits: responses.map ? toUnits(responses.map, "district") : children,
    weekly: area.counts,
    nationalWeekly: alignWeeks(weeks, responses.national).counts,
  };
}

// The country's weekly series is the same on every place of the page: fetched once per window.
const nationalCache = new Map<string, Promise<TransportRow[]>>();

/** The view for a period and place: four requests at most, in parallel. */
export async function fetchTransport(weeks: Week[], query: TransportQuery, token: string | null): Promise<TransportView> {
  const window = weekRangeParam(weeks, query.range);
  const allWeeks = weekRangeParam(weeks, { from: 0, to: weeks.length - 1 });
  const level = childLevelOf(query);

  const national =
    nationalCache.get(allWeeks) ??
    vlGetList<TransportRow>(ENDPOINTS.byWeek, { interval_dates: allWeeks }, token).catch((error) => {
      nationalCache.delete(allWeeks);
      throw error;
    });
  nationalCache.set(allWeeks, national);

  const [children, map, weekly, nationalRows] = await Promise.all([
    vlGetList<TransportRow>(ENDPOINTS.byLocation, { interval_dates: window, facility_type: LEVEL_PARAM[level], ...placeParams(query) }, token),
    query.district
      ? vlGetList<TransportRow>(ENDPOINTS.byLocation, { interval_dates: window, facility_type: "district", province: [query.province as string] }, token)
      : Promise.resolve(undefined),
    query.province ? vlGetList<TransportRow>(ENDPOINTS.byWeek, { interval_dates: allWeeks, ...placeParams(query) }, token) : national,
    national,
  ]);
  return buildView(weeks, query, { children, map, weekly, national: nationalRows });
}
