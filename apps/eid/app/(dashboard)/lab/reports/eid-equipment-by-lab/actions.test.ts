import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const lab = { testing_facility: "Lab A", testing_facility_code: "P01", tested: 30, CAPCTM: 1, ALINITY: 2, M2000: 3, C6800: 4, PANTHER: 5, MPIMA: 6, MANUAL: 7 };

describe("eid-equipment-by-lab", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", {});
    expect(eidGet).toHaveBeenCalledWith("/laboratories/samples_by_equipment/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the chosen lab codes", async () => {
    await fetchData(range, ["P01"], "t", {});
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("stacks the 7 groups, one bar per lab, leaving out rows with no name", () => {
    const c = toChart([lab, { ...lab, testing_facility: null }]);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("Excel has a Testadas row and the Laboratório corner", () => {
    const s = toExcel([lab]);
    expect(s.header).toEqual(["Laboratório", "Lab A"]);
    expect(s.rows[7]).toEqual(["Testadas", 30]);
  });
});
