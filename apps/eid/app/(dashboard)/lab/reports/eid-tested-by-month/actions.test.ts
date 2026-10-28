import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { extraParamsFor, fetchData, titleSuffixFor, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const rows = [{ year: 2026, month: 3, month_name: "March", total: 10, positive: 4, negative: 6 }];

describe("eid-tested-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", extraParamsFor("all"));
    expect(eidGet).toHaveBeenCalledWith("/laboratories/tested_samples_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("Todos sends no lab_type; the other tabs do", () => {
    expect(extraParamsFor("all")).toEqual({});
    expect(extraParamsFor("conventional")).toEqual({ lab_type: "conventional" });
    expect(extraParamsFor("poc")).toEqual({ lab_type: "poc" });
  });
  it("sends lab_type and lab codes", async () => {
    await fetchData(range, ["P01"], "t", extraParamsFor("poc"));
    expect(eidGet.mock.calls[0][1]).toEqual({ interval_dates: "2026-01-01,2026-06-30", lab_type: "poc", lab_code: ["P01"] });
  });
  it("title suffix", () => {
    expect(titleSuffixFor("all")).toBe("");
    expect(titleSuffixFor("conventional")).toBe(" (Convencional)");
    expect(titleSuffixFor("poc")).toBe(" (PoC)");
  });
  it("plots Positivo and Negativo = total - positive by month", () => {
    const c = toChart([...rows, { ...rows[0], month: 4, total: 2, positive: 5 }]);
    expect(c.labels).toHaveLength(2);
    expect(c.series.map((s) => [s.name, s.data])).toEqual([
      ["Positivo", [4, 5]],
      ["Negativo", [6, 0]],
    ]);
  });
  it("Excel corner is Mês", () => {
    expect(toExcel(rows).header[0]).toBe("Mês");
  });
});
