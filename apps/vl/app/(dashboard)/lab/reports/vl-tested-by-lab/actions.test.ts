import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [{ testing_facility: "Lab A", total: 10, suppressed: 7, not_suppressed: 3 }];

describe("vl-tested-by-lab", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories tested_samples", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tested_samples/");
  });
  it("stacks CV > 1000 and CV < 1000 per lab", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series.map((s) => s.data[0])).toEqual([3, 7]);
  });
  it("leaves out rows with no lab in the chart and the export", () => {
    const withNull = [{ testing_facility: null, total: 4, suppressed: 2, not_suppressed: 2 }, ...rows];
    expect(toChart(withNull).labels).toEqual(["Lab A"]);
    expect(toExcel(withNull).header).toEqual(["Laboratório", "Lab A"]);
  });
  it("exports with a Laboratório header", () => {
    expect(toExcel(rows).header).toEqual(["Laboratório", "Lab A"]);
  });
});
