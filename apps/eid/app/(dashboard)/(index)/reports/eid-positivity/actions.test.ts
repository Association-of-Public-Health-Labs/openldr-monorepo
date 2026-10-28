import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 3, month_name: "March", tested: 10, positive: 2, negative: 7, indeterminate: 1, conventional_positive: 1, poc_positive: 1, positivity: 20 },
  { year: 2026, month: 4, month_name: "April", tested: 0, positive: 0, negative: 0, indeterminate: 0, conventional_positive: 0, poc_positive: 0, positivity: 0 },
];

describe("eid-positivity", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("fetches summary/positivity with only interval_dates", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/positivity/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });

  it("draws Testadas as columns on the left axis and Positividade (%) as a line on the right axis", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26", "Abr/26"]);
    expect(c.series).toHaveLength(2);
    expect(c.series[0]).toMatchObject({ name: "Testadas", type: "column", yAxis: 0, data: [10, 0] });
    expect(c.series[1]).toMatchObject({ name: "Positividade (%)", type: "line", yAxis: 1, data: [20, 0] });
  });

  it("test_zero_tested_month_plots_zero", () => {
    const c = toChart([{ ...rows[1] }]);
    expect(c.series[1].data).toEqual([0]);
    expect(c.series[0].data).toEqual([0]);
  });

  it("plots a null positivity as 0", () => {
    const c = toChart([{ ...rows[1], positivity: null }]);
    expect(c.series[1].data).toEqual([0]);
  });

  it("exports the counts, both lab-type positives and the rate", () => {
    const x = toExcel(rows);
    expect(x.header).toEqual(["Positividade", "Mar/26", "Abr/26"]);
    expect(x.rows).toEqual([
      ["Testadas", 10, 0],
      ["Positivas", 2, 0],
      ["Negativas", 7, 0],
      ["Indeterminadas", 1, 0],
      ["Positivas Convencional", 1, 0],
      ["Positivas PoC", 1, 0],
      ["Positividade (%)", 20, 0],
    ]);
  });

  it("exports a null positivity as 0", () => {
    expect(toExcel([{ ...rows[1], positivity: null }]).rows[6]).toEqual(["Positividade (%)", 0]);
  });
});
