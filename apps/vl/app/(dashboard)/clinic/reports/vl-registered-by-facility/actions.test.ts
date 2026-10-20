import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [{ requesting_facility: "Gaza", total: 12 }];

describe("vl-registered-by-facility", () => {
  it("uses registered_samples and registration-date patients", () => {
    expect(ENDPOINT).toBe("/facilities/registered_samples/");
    expect(PATIENT_FILTERS).toEqual({ date_basis: "registration" });
  });
  it("draws one red series per location and exports under the level label", () => {
    expect(toChart(rows)).toEqual({
      labels: ["Gaza"],
      series: [{ name: "Amostras Registadas", color: "#ef5350", data: [12] }],
    });
    expect(toExcel(rows, "Província")).toEqual({ header: ["Província", "Gaza"], rows: [["Amostras Registadas", 12]] });
  });
});
