import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const lab = { receiving_facility: "Lab A", receiving_facility_code: "P01", repeat_test: 1, insufficient_sample: 2, request_without_sample: 3, technical_problems: 4, overlapping_blood: 5, duplicate_registration: 6, misidentified_sample: 7, sample_over_30_days: 8, other: 9, total: 50 };

describe("eid-rejected-by-lab", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", {});
    expect(eidGet).toHaveBeenCalledWith("/laboratories/rejected_samples/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the chosen lab codes (the receiving lab)", async () => {
    await fetchData(range, ["P01"], "t", {});
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("stacks the 9 reasons, x = receiving_facility, leaving out rows with no name", () => {
    const c = toChart([lab, { ...lab, receiving_facility: null }]);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("Excel Total row can exceed the sum of reasons (R10)", () => {
    const s = toExcel([lab]);
    expect(s.header).toEqual(["Laboratório", "Lab A"]);
    expect(s.rows[9]).toEqual(["Total", 50]);
  });
});
