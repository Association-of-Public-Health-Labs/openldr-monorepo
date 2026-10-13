import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tat-by-lab", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories tat_by_lab", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tat_by_lab/");
  });
  it("stacks the 4 segments per lab", () => {
    const c = toChart([
      { testing_facility: "Lab A", collection_reception: 1, reception_registration: 2, registration_analysis: 3, analysis_validation: 4 },
    ]);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series).toHaveLength(4);
  });
});
