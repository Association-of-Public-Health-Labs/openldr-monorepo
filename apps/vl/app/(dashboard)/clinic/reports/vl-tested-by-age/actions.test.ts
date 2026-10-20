import { describe, expect, it } from "vitest";
import { ENDPOINT, patientFiltersFor } from "./constants";
import { sumByFacility, toChart } from "./actions";

const rows = [
  { requesting_facility: "Gaza", age_group: "15-19", total: 3, suppressed: 2, not_suppressed: 1 },
  { requesting_facility: "Gaza", age_group: "20-24", total: 4, suppressed: 4, not_suppressed: 0 },
  { requesting_facility: "Tete", age_group: "15-19", total: 1, suppressed: 0, not_suppressed: 1 },
];

describe("vl-tested-by-age", () => {
  it("uses tested_samples_by_age_by_facility and adds the age range to tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_age_by_facility/");
    expect(patientFiltersFor([15, 49])).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
      age_range: [15, 49],
    });
  });
  it("sums the age-group rows per location, keeping first-seen order", () => {
    expect(sumByFacility(rows)).toEqual([
      { requesting_facility: "Gaza", total: 7, suppressed: 6, not_suppressed: 1 },
      { requesting_facility: "Tete", total: 1, suppressed: 0, not_suppressed: 1 },
    ]);
    expect(toChart(rows).labels).toEqual(["Gaza", "Tete"]);
  });
});
