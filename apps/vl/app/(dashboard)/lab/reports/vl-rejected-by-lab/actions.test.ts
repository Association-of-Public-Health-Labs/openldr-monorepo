import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

describe("vl-rejected-by-lab", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories rejected_samples", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, ["PJC"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/rejected_samples/", { interval_dates: "2026-01-01,2026-12-31", lab_code: ["PJC"] }, "t");
  });
  it("has one red series of rejected totals per lab", () => {
    const rows = [{ lab_code: "PJC", testing_facility: "Jose Macamo", total: 12 }];
    expect(toChart(rows).series).toEqual([{ name: "Amostras Rejeitadas", color: "#ef5350", data: [12] }]);
    expect(toExcel(rows)).toEqual({ header: ["Laboratório", "Jose Macamo"], rows: [["Amostras Rejeitadas", 12]] });
  });
});
