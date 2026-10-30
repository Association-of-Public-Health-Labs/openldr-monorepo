import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart, toExcel } from "./actions";

describe("vl-tested-by-facility", () => {
  it("uses tested_samples_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("stacks CV series per location", () => {
    const rows = [{ requesting_facility: "Chokwe", total: 5, suppressed: 4, not_suppressed: 1 }];
    expect(toChart(rows).series.map((s) => s.data[0])).toEqual([1, 4]);
    expect(toExcel(rows, "Distrito").header).toEqual(["Distrito", "Chokwe"]);
  });
});
