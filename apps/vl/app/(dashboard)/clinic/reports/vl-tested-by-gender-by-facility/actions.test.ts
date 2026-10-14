import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tested-by-gender-by-facility", () => {
  it("uses tested_samples_by_gender_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_gender_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("produces the 4 grouped gender series", () => {
    const c = toChart([
      { requesting_facility: "Gaza", total: 10, male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 },
    ]);
    expect(c.series.map((s) => s.group)).toEqual(["Homens", "Homens", "Mulheres", "Mulheres"]);
  });
});
