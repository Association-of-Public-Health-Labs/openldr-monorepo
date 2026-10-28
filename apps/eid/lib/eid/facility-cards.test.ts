import { describe, expect, it } from "vitest";
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
  rejectedFacilityChart,
  rejectedFacilityExcel,
  genderChart,
  genderExcel,
  genderMonthChart,
  genderMonthExcel,
} from "./facility-cards";

const fac = [
  { requesting_facility: "Gaza", total: 10, conventional: 7, poc: 3, positive: 2, negative: 6 },
  { requesting_facility: "Maputo", total: 4, conventional: 4, poc: 0, positive: 1, negative: 3 },
];
const months = [{ year: 2026, month: 3, month_name: "March", total: 10, conventional: 7, poc: 3, positive: 2, negative: 6 }];

describe("EID facility cards: registered and tested", () => {
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

describe("EID facility cards: rejected and gender", () => {
  const rej = (name: string | null, n: number) => ({
    requesting_facility: name, repeat_test: n, insufficient_sample: 0, request_without_sample: 0, technical_problems: 0,
    overlapping_blood: 0, duplicate_registration: 0, misidentified_sample: 0, sample_over_30_days: 0, other: 1, total: n + 3,
  });
  it("rejected by place: 9 reasons and a Total row from the API total (R10)", () => {
    const rows = [rej("Gaza", 2), rej("Maputo", 5)];
    const chart = rejectedFacilityChart(rows);
    expect(chart.labels).toEqual(["Gaza", "Maputo"]);
    expect(chart.series).toHaveLength(9);
    const sheet = rejectedFacilityExcel(rows, "Distrito");
    expect(sheet.header).toEqual(["Distrito", "Gaza", "Maputo"]);
    expect(sheet.rows).toHaveLength(10);
    expect(sheet.rows[9]).toEqual(["Total", 5, 8]);
  });
  it("gender by place and by month", () => {
    const g = { requesting_facility: "Gaza", male_positive: 1, male_negative: 2, female_positive: 3, female_negative: 4 };
    expect(genderChart([g]).labels).toEqual(["Gaza"]);
    expect(genderChart([g]).series.map((s) => s.data[0])).toEqual([1, 2, 3, 4]);
    expect(genderExcel([g], "Província").header).toEqual(["Província", "Gaza"]);
    const m = { year: 2026, month: 3, month_name: "March", male_positive: 1, male_negative: 2, female_positive: 3, female_negative: 4 };
    expect(genderMonthChart([m]).labels[0]).toBe(monthLabel(2026, 3));
    expect(genderMonthExcel([m]).header[0]).toBe("Mês");
  });
});
