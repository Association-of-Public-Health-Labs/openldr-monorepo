import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-rejected-by-facility", () => {
  it("uses rejected_samples_by_facility and rejected patients", () => {
    expect(ENDPOINT).toBe("/facilities/rejected_samples_by_facility/");
    expect(PATIENT_FILTERS).toEqual({ rejected: true });
  });
  it("draws one red series", () => {
    expect(toChart([{ requesting_facility: "Gaza", total: 3 }]).series).toEqual([
      { name: "Amostras Rejeitadas", color: "#ef5350", data: [3] },
    ]);
  });
});
