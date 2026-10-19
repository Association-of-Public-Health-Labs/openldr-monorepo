import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2025, month: 12, month_name: "December", total: 3, suppressed: 2, not_suppressed: 1 },
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
  it("stacks suppressed and not suppressed tests per month (the bar is the month's tests)", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Dez/25", "Jan/26"]);
    expect(c.series[0]).toMatchObject({ name: "Suprimidas", color: "#00B000", data: [2, 0] });
    expect(c.series[1]).toMatchObject({ name: "Não suprimidas", color: "#EF5350", data: [1, 0] });
    expect(c.series[0].type ?? "column").toBe("column");
  });
  it("draws the suppression rate (one decimal, as the map card) as a line on the right axis; 0 for months without results", () => {
    const rate = toChart(rows).series[2];
    expect(rate).toMatchObject({ name: "Taxa de supressão", type: "line", yAxis: 1, data: [66.7, 0] });
  });
  it("exports the tests, their split and the rate per month", () => {
    expect(toExcel(rows)).toEqual({
      header: ["Supressão Viral", "Dez/25", "Jan/26"],
      rows: [
        ["Suprimidas", 2, 0],
        ["Não suprimidas", 1, 0],
        ["Amostras testadas", 3, 0],
        ["Taxa de supressão (%)", 66.7, 0],
      ],
    });
  });
});
