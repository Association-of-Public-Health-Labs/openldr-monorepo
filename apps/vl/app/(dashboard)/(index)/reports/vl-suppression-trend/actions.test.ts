import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2025, month: 12, month_name: "December", total: 4, suppressed: 3, not_suppressed: 1 },
  { year: 2026, month: 1, month_name: "January", total: 0, suppressed: 0, not_suppressed: 0 },
];

describe("vl-suppression-trend", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches viral_suppression_by_month with the window", async () => {
    await fetchData({ start: "2025-01-01", end: "2025-12-31" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/viral_suppression_by_month/", { interval_dates: "2025-01-01,2025-12-31" }, "t");
  });
  it("plots rounded suppression % per month, 0 for empty months", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Dez/25", "Jan/26"]);
    expect(c.series[0]).toMatchObject({ name: "Supressão Viral", type: "line", color: "#00b000", data: [75, 0] });
  });
  it("exports the legacy Excel layout", () => {
    expect(toExcel(rows)).toEqual({ header: ["Supressão Viral", "Dez/25", "Jan/26"], rows: [["Total %", 75, 0]] });
  });
});
