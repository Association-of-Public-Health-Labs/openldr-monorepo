import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { recentWeeks } from "@repo/design_system/lib/weeks";
import { alignWeeks, buildView, fetchTransport, NATIONAL, toUnits, type TransportRow } from "./data";

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

  it("names places by the level, without the rows that have no place", () => {
    const rows = [row({ province: "Gaza" }), row({ province: null }), row({ province: " " })];
    expect(toUnits(rows, "province")).toEqual([{ name: "Gaza", counts: [4, 3, 2, 1], noReceptionDate: 0 }]);
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
});
