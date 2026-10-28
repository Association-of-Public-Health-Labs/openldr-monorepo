import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();

import { recentWeeks } from "../../weeks";
import { alignWeeks, buildView, dataFor, fetchTransport as fetchWith, NATIONAL, toUnits, transportEndpoints, type GetList, type TransportQuery, type TransportRow } from "./data";

// VL's calls, as before the move: its list fetcher and its endpoints.
const vlGetList = ((...a: unknown[]) => vlGet(...a)) as GetList;
const fetchTransport = (w: typeof weeks, query: TransportQuery, token: string | null) => fetchWith(vlGetList, transportEndpoints("/hiv/vl"), w, query, token);

// 28 Sunday–Saturday weeks ending 11–17 Oct 2026.
const weeks = recentWeeks(28, new Date(2026, 9, 21));
const last = { from: 27, to: 27 };

const row = (fields: Partial<TransportRow>): TransportRow => ({
  start_date: "2026-10-11",
  end_date: "2026-10-17",
  samples_with_collection_date: 10,
  lt_7: 4,
  between_7_15: 3,
  between_16_21: 2,
  gt_21: 1,
  no_reception_date: 0,
  total_tested: null,
  no_collection_date: null,
  ...fields,
});

describe("transport data from the API", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });

  it("lines week rows up with the picker's weeks and ignores non-Sunday–Saturday windows", () => {
    const rows = [
      row({ start_date: "2026-10-11T00:00:00", end_date: "2026-10-17T00:00:00" }),
      row({ start_date: "2026-10-12", end_date: "2026-10-17", lt_7: 99 }), // Monday to Saturday
    ];
    const { counts } = alignWeeks(weeks, rows);
    expect(counts).toHaveLength(28);
    expect(counts[27]).toEqual([4, 3, 2, 1]);
    expect(counts[26]).toEqual([0, 0, 0, 0]);
  });

  it("names places by the level and groups the rows without a place last, so the units add up to the area", () => {
    const rows = [row({ province: null }), row({ province: "Gaza" }), row({ province: " " })];
    expect(toUnits(rows, "province")).toEqual([
      { name: "Gaza", counts: [4, 3, 2, 1], noReceptionDate: 0 },
      { name: "Sem província", counts: [8, 6, 4, 2], noReceptionDate: 0, unknown: true },
    ]);
    expect(toUnits([row({ district: null })], "district")[0]?.name).toBe("Sem distrito");
  });

  it("merges rows of the same place (a facility whose code is missing in some weeks)", () => {
    const rows = [row({ health_facility: "CS Morrumbene", facility_code: null, lt_7: 1, between_7_15: 0, between_16_21: 0, gt_21: 0 }), row({ health_facility: "CS Morrumbene", facility_code: "01081111", no_reception_date: 2 })];
    expect(toUnits(rows, "facility")).toEqual([{ name: "CS Morrumbene", counts: [5, 3, 2, 1], noReceptionDate: 2 }]);
  });

  it("builds the area from its weekly rows over the chosen weeks", () => {
    const weekly = [row({ start_date: "2026-10-04", end_date: "2026-10-10", lt_7: 1, between_7_15: 1, between_16_21: 0, gt_21: 0 }), row({ no_reception_date: 2 })];
    const view = buildView(weeks, { range: { from: 26, to: 27 }, province: null, district: null }, {
      children: [row({ province: "Gaza" })],
      weekly,
      national: weekly,
    });
    expect(view.area).toEqual({ name: NATIONAL, counts: [5, 4, 2, 1], noReceptionDate: 2 });
    expect(view.childLevel).toBe("province");
    expect(view.mapUnits).toEqual(view.children);
  });

  it("asks the endpoints for the place's level, its weeks and the country's weeks", async () => {
    await fetchTransport(weeks, { range: last, province: "Gaza", district: "Chokwe" }, "t");
    const calls = vlGet.mock.calls.map(([path, params]) => [path, params]);
    expect(calls).toContainEqual([
      "/transport/tat_by_location/",
      { interval_dates: "2026-10-11,2026-10-17", facility_type: "health_facility", province: ["Gaza"], district: ["Chokwe"] },
    ]);
    // The map keeps the province's districts while a district is open.
    expect(calls).toContainEqual([
      "/transport/tat_by_location/",
      { interval_dates: "2026-10-11,2026-10-17", facility_type: "district", province: ["Gaza"] },
    ]);
    expect(calls).toContainEqual([
      "/transport/tat_by_week/",
      { interval_dates: "2026-04-05,2026-10-17", province: ["Gaza"], district: ["Chokwe"] },
    ]);
  });

  it("fetches the country's weekly series once for every place on the page", async () => {
    await fetchTransport(weeks, { range: last, province: null, district: null }, "t");
    await fetchTransport(weeks, { range: last, province: "Tete", district: null }, "t");
    const national = vlGet.mock.calls.filter(([path, params]) => path === "/transport/tat_by_week/" && !params.province);
    expect(national.length).toBeLessThanOrEqual(1);
  });

  it("test_national_cache_keyed_by_endpoint", async () => {
    const a = vi.fn().mockResolvedValue([]);
    const b = vi.fn().mockResolvedValue([]);
    const query = { range: last, province: null, district: null };
    const national = (get: ReturnType<typeof vi.fn>) =>
      get.mock.calls.filter(([path, params]) => path === "/transport/tat_by_week/" && !params.province);
    // Two apps (two API bases) on the same window: each fetches its own national series once.
    await fetchWith(a as unknown as GetList, transportEndpoints("/test/a"), weeks, query, "t");
    await fetchWith(a as unknown as GetList, transportEndpoints("/test/a"), weeks, { ...query, province: "Tete" }, "t");
    await fetchWith(b as unknown as GetList, transportEndpoints("/test/b"), weeks, query, "t");
    expect(national(a)).toHaveLength(1);
    expect(national(b)).toHaveLength(1);
    // Another filter is another series, sent with the filter.
    await fetchWith(a as unknown as GetList, transportEndpoints("/test/a"), weeks, { ...query, extraParams: { type_of_test: "Convencional" } }, "t");
    expect(national(a)).toHaveLength(2);
    expect(national(a)[1]?.[1]).toEqual({ interval_dates: "2026-04-05,2026-10-17", type_of_test: "Convencional" });
  });

  it("sends the extra params with every request", async () => {
    const get = vi.fn().mockResolvedValue([]);
    await fetchWith(get as unknown as GetList, transportEndpoints("/test/extra"), weeks, { range: last, province: "Gaza", district: "Chokwe", extraParams: { type_of_test: "Point-of-care" } }, "t");
    expect(get.mock.calls).toHaveLength(4);
    for (const [, params] of get.mock.calls) expect(params.type_of_test).toBe("Point-of-care");
  });

  it("tags the view with its extra params, so a stale response is not drawn under another filter", () => {
    const responses = { children: [], weekly: [], national: [] };
    const all = buildView(weeks, { range: last, province: null, district: null }, responses);
    const poc = buildView(weeks, { range: last, province: null, district: null, extraParams: { type_of_test: "Point-of-care" } }, responses);
    expect(dataFor(all, undefined)).toBe(all);
    expect(dataFor(all, {})).toBe(all);
    expect(dataFor(all, { type_of_test: "Point-of-care" })).toBeNull();
    expect(dataFor(poc, { type_of_test: "Point-of-care" })).toBe(poc);
    expect(dataFor(poc, undefined)).toBeNull();
    expect(dataFor(null, undefined)).toBeNull();
  });
});
