import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-test-reasons-national", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("asks for the clinic card's default view: every province, dates only", async () => {
    await fetchData({ start: "2025-11-01", end: "2026-10-21" }, "t");
    expect(vlGet).toHaveBeenCalledWith(
      "/facilities/tested_samples_by_test_reason_by_facility/",
      { interval_dates: "2025-11-01,2026-10-21", facility_type: "province", disaggregation: "false" },
      "t",
    );
  });
  it("sums the provinces into the national slices", () => {
    const rows = [
      { requesting_facility: "Gaza", routine: 10, treatment_failure: 2, reason_not_specified: 1, total: 13 },
      { requesting_facility: "Tete", routine: 5, treatment_failure: 0, reason_not_specified: 3, total: 8 },
    ];
    expect(toChart(rows).series[0].data).toEqual([4, 15, 2]);
  });
});
