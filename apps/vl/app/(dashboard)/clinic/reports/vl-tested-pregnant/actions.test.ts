import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tested-pregnant", () => {
  it("uses the pregnant by-facility endpoint and pregnant patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_pregnant_by_facility/");
    expect(PATIENT_FILTERS).toMatchObject({ pregnant: true, date_basis: "analysis" });
  });
  it("stacks CV series", () => {
    expect(toChart([{ requesting_facility: "Gaza", total: 2, suppressed: 1, not_suppressed: 1 }]).series).toHaveLength(2);
  });
});
