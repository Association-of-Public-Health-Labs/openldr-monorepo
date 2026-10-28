import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const rows = [{ year: 2026, month: 3, month_name: "March", tested: 30, CAPCTM: 1, ALINITY: 2, M2000: 3, C6800: 4, PANTHER: 5, MPIMA: 6, MANUAL: 7 }];

describe("lab eid-equipment-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", {});
    expect(eidGet).toHaveBeenCalledWith("/laboratories/samples_by_equipment_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the chosen lab codes", async () => {
    await fetchData(range, ["P01"], "t", {});
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("stacks the 7 groups by month", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("Excel has a Testadas row", () => {
    const s = toExcel(rows);
    expect(s.header).toEqual(["Equipamento", "Mar/26"]);
    expect(s.rows[7]).toEqual(["Testadas", 30]);
  });
});
