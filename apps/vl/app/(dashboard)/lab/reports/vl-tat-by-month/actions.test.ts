import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tat-by-month", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories tat_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tat_by_month/");
  });
  it("labels by month", () => {
    const c = toChart([
      { year: 2026, month: 1, month_name: "January", collection_reception: 1, reception_registration: null, registration_analysis: 3, analysis_validation: 4 },
    ]);
    expect(c.labels).toEqual(["Jan/26"]);
    expect(c.series[1].data).toEqual([0]);
  });
});
