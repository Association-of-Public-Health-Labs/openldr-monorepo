import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tested-by-month", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories tested_samples_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, ["PMB"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/tested_samples_by_month/", { interval_dates: "2026-01-01,2026-12-31", lab_code: ["PMB"] }, "t");
  });
  it("labels by month", () => {
    const c = toChart([{ year: 2026, month: 5, month_name: "May", total: 3, suppressed: 2, not_suppressed: 1 }]);
    expect(c.labels).toEqual(["Mai/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2]);
  });
});
