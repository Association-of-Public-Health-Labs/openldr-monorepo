import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const rows = [{ year: 2026, month: 3, month_name: "March", total: 10, conventional: 7, poc: 3 }];

describe("eid-registered-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/registered_samples_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the lab codes (receiving lab)", async () => {
    await fetchData(range, ["P01"], "t");
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("plots Convencional and PoC", () => {
    const c = toChart(rows);
    expect(c.series.map((s) => [s.name, s.data])).toEqual([
      ["Convencional", [7]],
      ["PoC", [3]],
    ]);
  });
  it("Excel corner is Mês", () => {
    expect(toExcel(rows).header[0]).toBe("Mês");
  });
});
