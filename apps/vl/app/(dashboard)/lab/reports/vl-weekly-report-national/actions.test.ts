import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { week: "39", start: "2026-09-27", end: "2026-10-03", backlogs: 1, tests: 2, registrations: 3, rejections: 4, capacity: 5, tat: 6.4 },
];

describe("vl-weekly-report-national", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches weekly_report_national", async () => {
    await fetchData({ start: "2026-07-21", end: "2026-10-13" }, [], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/weekly_report_national/", { interval_dates: "2026-07-21,2026-10-13", lab_code: [] }, "t");
  });
  it("has 3 columns, a capacity line on the left axis and TRL on the right axis", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["39"]);
    expect(c.series.map((s) => [s.name, s.type ?? "column", s.yAxis ?? 0])).toEqual([
      ["Registadas", "column", 0],
      ["Testadas", "column", 0],
      ["Não processadas", "column", 0],
      ["Capacidade", "line", 0],
      ["TRL", "line", 1],
    ]);
    expect(c.series[4].data).toEqual([6.4]);
  });
  it("exports one column per week", () => {
    expect(toExcel(rows).header).toEqual(["", "39"]);
  });
});
