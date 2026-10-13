import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 4, month_name: "April", total: 10, male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 },
];

describe("vl-tested-by-gender-by-month", () => {
  it("uses tested_samples_by_gender_by_month", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_gender_by_month/");
  });
  it("labels by month with the 4 gender series", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Abr/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4]);
    expect(toExcel(rows, "Província").header).toEqual(["Mês", "Abr/26"]);
  });
});
