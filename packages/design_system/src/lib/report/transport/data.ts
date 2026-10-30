/**
 * Data of the Transporte page, from the API's transport TAT endpoints (api_openldr_python
 * `/hiv/vl/transport/...` and `/hiv/eid/transport/...`), which read the weekly transport tables
 * (ReportData.VLTransportTATPerWeek, ReportData.EIDTransportTATPerWeek). Both answer with the
 * same count keys. Weeks are Sunday to Saturday, as in the weekly spreadsheets; rows for any other
 * window are ignored.
 */
import { isSundayToSaturday, weekRangeParam, type Week, type WeekRange } from "../../weeks";
import type { Params } from "../params";
import type { ReportServices } from "../../../hooks/report/report-context";
import { addCounts, EMPTY, type TatCounts } from "../tat";

/** The app's list fetcher (`ReportServices.getList`): it adds the app's API base to the path. */
export type GetList = ReportServices["getList"];

/** The two transport endpoints, relative to the app's API base. */
export const ENDPOINTS = {
  byLocation: "/transport/tat_by_location/",
  byWeek: "/transport/tat_by_week/",
} as const;

export type TransportEndpoints = {
  /**
   * The app's API base ("/hiv/vl", "/hiv/eid"). `getList` adds it to the paths itself; here it
   * only keeps two apps' national series apart in the cache.
   */
  base: string;
  byLocation: string;
  byWeek: string;
};

/** The endpoints of an app whose API base is `base`. */
export const transportEndpoints = (base: string): TransportEndpoints => ({ base, ...ENDPOINTS });

export type TatUnit = {
  name: string;
  counts: TatCounts;
  /** Samples with a collection date but no reception date at the lab. */
  noReceptionDate: number;
  /** Samples whose place is not recorded (no province, district or facility name). */
  unknown?: true;
};

export type ChildLevel = "province" | "district" | "facility";

export type TransportQuery = {
  range: WeekRange;
  province: string | null;
  district: string | null;
  /** Sent with every request (EID's `type_of_test`); none by default. */
  extraParams?: Params;
};

export type TransportData = {
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
  /** `paramsKey` of the extra params it was fetched for, so a stale response is never drawn under another filter. */
  fetchedFor: string;
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

/** Name of the group of samples whose place is not recorded, so the children add up to the area. */
export const UNKNOWN_NAME: Record<ChildLevel, string> = {
  province: "Sem província",
  district: "Sem distrito",
  facility: "Sem unidade sanitária",
};

/** One unit per place; rows without a place name (the table has a few) are grouped as unknown, last. */
export function toUnits(rows: TransportRow[], level: ChildLevel): TatUnit[] {
  const field = NAME_FIELD[level];
  const byName = new Map<string, TatUnit>();
  for (const row of rows) {
    const known = (row[field] ?? "").trim();
    const name = known || UNKNOWN_NAME[level];
    const seen = byName.get(name);
    byName.set(name, {
      name,
      counts: seen ? addCounts(seen.counts, toCounts(row)) : toCounts(row),
      noReceptionDate: (seen?.noReceptionDate ?? 0) + (row.no_reception_date || 0),
      ...(known ? {} : { unknown: true as const }),
    });
  }
  const units = [...byName.values()];
  return [...units.filter((u) => !u.unknown), ...units.filter((u) => u.unknown)];
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

/**
 * A stable key for extra params: sorted, with the values the request drops (undefined, "", [])
 * left out, so `{}` and no params are the same filter.
 */
export function paramsKey(params?: Params): string {
  const entries = Object.entries(params ?? {})
    .filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return JSON.stringify(entries);
}

/** The fetched data when it is for these extra params; else null (the view shows its loading state). */
export const dataFor = (data: TransportData | null, extraParams?: Params): TransportData | null =>
  data && data.fetchedFor === paramsKey(extraParams) ? data : null;

/** Params the page sets itself: an `extraParams` key of these names is ignored. */
const OWNED_PARAMS = ["interval_dates", "facility_type", "province", "district", "health_facility"];

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
export function buildView(weeks: Week[], query: TransportQuery, responses: TransportResponses): TransportData {
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
    fetchedFor: paramsKey(query.extraParams),
  };
}

// The country's weekly series is the same on every place of the page: fetched once per window
// (and per app and filter: the key carries the API base, the endpoint and the extra params).
const nationalCache = new Map<string, Promise<TransportRow[]>>();

/** The national cache's key for a window. */
export const nationalCacheKey = (endpoints: TransportEndpoints, window: string, extraParams?: Params) =>
  `${endpoints.base}${endpoints.byWeek}|${window}|${paramsKey(extraParams)}`;

/** The view for a period and place: four requests at most, in parallel. */
export async function fetchTransport(
  getList: GetList,
  endpoints: TransportEndpoints,
  weeks: Week[],
  query: TransportQuery,
  token: string | null,
): Promise<TransportData> {
  const window = weekRangeParam(weeks, query.range);
  const allWeeks = weekRangeParam(weeks, { from: 0, to: weeks.length - 1 });
  const level = childLevelOf(query);
  // Spread first in each request, and the keys the page owns dropped, so extra params can never override them.
  const extra = Object.fromEntries(Object.entries(query.extraParams ?? {}).filter(([k]) => !OWNED_PARAMS.includes(k)));
  const key = nationalCacheKey(endpoints, allWeeks, query.extraParams);

  const national =
    nationalCache.get(key) ??
    getList<TransportRow>(endpoints.byWeek, { ...extra, interval_dates: allWeeks }, token).catch((error) => {
      nationalCache.delete(key);
      throw error;
    });
  nationalCache.set(key, national);

  const [children, map, weekly, nationalRows] = await Promise.all([
    getList<TransportRow>(endpoints.byLocation, { ...extra, interval_dates: window, facility_type: LEVEL_PARAM[level], ...placeParams(query) }, token),
    query.district
      ? getList<TransportRow>(endpoints.byLocation, { ...extra, interval_dates: window, facility_type: "district", province: [query.province as string] }, token)
      : Promise.resolve(undefined),
    query.province ? getList<TransportRow>(endpoints.byWeek, { ...extra, interval_dates: allWeeks, ...placeParams(query) }, token) : national,
    national,
  ]);
  return buildView(weeks, query, { children, map, weekly, national: nationalRows });
}
