import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tat-by-facility", () => {
  it("uses tat_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tat_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("stacks TAT segments per location", () => {
    const c = toChart([
      { requesting_facility: "Gaza", collection_reception: 1, reception_registration: 2, registration_analysis: null, analysis_validation: 4 },
    ]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 0, 4]);
  });
});
