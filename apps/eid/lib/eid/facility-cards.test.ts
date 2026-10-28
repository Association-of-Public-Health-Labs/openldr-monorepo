import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import { PATIENT_COLUMNS } from "./patients";
import {
  registeredChart,
  registeredExcel,
  registeredMonthChart,
  registeredMonthExcel,
  testedChart,
  testedExcel,
  testedMonthChart,
  testedMonthExcel,
} from "./facility-cards";

const fac = [
  { requesting_facility: "Gaza", total: 10, conventional: 7, poc: 3, positive: 2, negative: 6 },
  { requesting_facility: "Maputo", total: 4, conventional: 4, poc: 0, positive: 1, negative: 3 },
];
const months = [{ year: 2026, month: 3, month_name: "March", total: 10, conventional: 7, poc: 3, positive: 2, negative: 6 }];

describe("EID facility cards: registered and tested", () => {
  it("default request equals the cache seed", () => {
    expect(facilityParams({ start: "2026-01-01", end: "2026-06-30" }, INITIAL_DRILL)).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
  it("plots grouped Convencional and PoC per place", () => {
    for (const chart of [registeredChart(fac), testedChart(fac)]) {
      expect(chart.labels).toEqual(["Gaza", "Maputo"]);
      expect(chart.series.map((s) => [s.name, s.data, s.group])).toEqual([
        ["Convencional", [7, 4], undefined],
        ["PoC", [3, 0], undefined],
      ]);
    }
  });
  it("plots month labels on the by-month cards", () => {
    for (const chart of [registeredMonthChart(months), testedMonthChart(months)]) {
      expect(chart.labels).toHaveLength(1);
      expect(chart.labels[0]).toBe(monthLabel(2026, 3));
      expect(chart.series.map((s) => s.data)).toEqual([[7], [3]]);
    }
  });
  it("Excel corner is the level label, or Mês", () => {
    expect(registeredExcel(fac, "Distrito").header).toEqual(["Distrito", "Gaza", "Maputo"]);
    expect(testedExcel(fac, "Província").header[0]).toBe("Província");
    expect(registeredMonthExcel(months).header[0]).toBe("Mês");
    expect(testedMonthExcel(months).header[0]).toBe("Mês");
  });
  it("registered Excel has no result rows", () => {
    expect(registeredExcel(fac, "x").rows.map((r) => r[0])).toEqual(["Convencional", "PoC"]);
  });
  it("tested Excel adds Positivas and Negativas", () => {
    expect(testedExcel(fac, "x").rows.slice(2)).toEqual([
      ["Positivas", 2, 1],
      ["Negativas", 6, 3],
    ]);
    expect(testedMonthExcel(months).rows.slice(2)).toEqual([["Positivas", 2], ["Negativas", 6]]);
  });
  it("every patient column has a label", () => {
    expect(PATIENT_COLUMNS.every((c) => c.label.trim() !== "")).toBe(true);
  });
});
