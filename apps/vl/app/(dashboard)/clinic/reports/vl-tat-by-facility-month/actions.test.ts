import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart } from "./actions";

describe("vl-tat-by-facility-month", () => {
  it("uses facilities tat_by_month (facility_type is sent: Ruling P10)", () => {
    expect(ENDPOINT).toBe("/facilities/tat_by_month/");
  });
  it("stacks the TAT segments by month", () => {
    const c = toChart([
      { year: 2026, month: 7, month_name: "July", collection_reception: 1, reception_registration: 1, registration_analysis: 1, analysis_validation: 1 },
    ]);
    expect(c.labels).toEqual(["Jul/26"]);
    expect(c.series).toHaveLength(4);
  });
});
