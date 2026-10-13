import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toExcel, toTable } from "./actions";

const rows = [
  { year: 2026, month: 1, month_name: "January", registered: 10, tested: 8, suppressed: 6, rejected: 1, non_validated: 2 },
  { year: 2026, month: 2, month_name: "February", registered: 5, tested: 5, suppressed: 4, rejected: 0, non_validated: 0 },
];

describe("vl-indicators-summary", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches samples_history", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-02-28" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/samples_history/", { interval_dates: "2026-01-01,2026-02-28" }, "t");
  });
  it("puts months in columns and the 5 legacy indicators in rows, in order", () => {
    const t = toTable(rows);
    expect(t.columns).toEqual(["Jan/26", "Fev/26"]);
    expect(t.rows).toEqual([
      { label: "Amostras Registadas", values: [10, 5] },
      { label: "Amostras Testadas", values: [8, 5] },
      { label: "Amostras com CV<1000", values: [6, 4] },
      { label: "Amostras não validadas", values: [2, 0] },
      { label: "Amostras Rejeitadas", values: [1, 0] },
    ]);
  });
  it("exports the same table", () => {
    expect(toExcel(rows).header).toEqual(["Indicadores", "Jan/26", "Fev/26"]);
    expect(toExcel(rows).rows[0]).toEqual(["Amostras Registadas", 10, 5]);
  });
});
