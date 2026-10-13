import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 3, month_name: "March", collection_reception: 4, reception_registration: 1, registration_analysis: 6, analysis_validation: null },
];

describe("vl-tat-national", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches summary tat_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/tat_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("stacks the 4 TAT segments by month", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([4, 1, 6, 0]);
  });
  it("exports one row per segment", () => {
    expect(toExcel(rows).header).toEqual(["Tempo Resposta", "Mar/26"]);
    expect(toExcel(rows).rows).toHaveLength(4);
  });
});
