import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { EQUIPMENT_GROUPS } from "@/lib/eid/series";
import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 3, month_name: "March", tested: 30, CAPCTM: 1, ALINITY: 2, M2000: 3, C6800: 4, PANTHER: 5, MPIMA: 6, MANUAL: 7 },
];

describe("eid-equipment-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("fetches summary/samples_by_equipment_by_month/ with only the period", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/samples_by_equipment_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });

  it("stacks the 7 analyser groups in order", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.name)).toEqual(EQUIPMENT_GROUPS.map((g) => g.label));
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("exports a Testadas row after the groups", () => {
    const sheet = toExcel(rows);
    expect(sheet.header).toEqual(["Equipamento", "Mar/26"]);
    expect(sheet.rows).toHaveLength(8);
    expect(sheet.rows[7]).toEqual(["Testadas", 30]);
  });
});
