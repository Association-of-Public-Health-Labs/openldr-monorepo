import { describe, expect, it } from "vitest";
import { ENDPOINT, PIE_COLORS } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [
  { requesting_facility: "Gaza", routine: 10, treatment_failure: 2, reason_not_specified: 1, total: 15 },
  { requesting_facility: "Tete", routine: 5, treatment_failure: 0, reason_not_specified: 3, total: 9 },
];

describe("vl-test-reasons", () => {
  it("uses the by-facility test-reason endpoint with 3 legacy colours", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_test_reason_by_facility/");
    expect(PIE_COLORS).toEqual(["#00b000", "#fb8c00", "#ef5350"]);
  });
  it("sums the location rows into the 3 legacy slices, in legacy order", () => {
    expect(toChart(rows)).toEqual({
      labels: ["Motivo não especificado", "Rotina", "Falência Terapêutica"],
      series: [{ name: "Amostras", color: "#00b000", data: [4, 15, 2] }],
    });
  });
  it("exports one row of counts", () => {
    expect(toExcel(rows, "Província")).toEqual({
      header: ["", "Motivo não especificado", "Rotina", "Falência Terapêutica"],
      rows: [["Amostras", 4, 15, 2]],
    });
  });
});
