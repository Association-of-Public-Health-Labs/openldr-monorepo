import { describe, expect, it } from "vitest";
import { chartToSheet, cvSeries, genderSeries, singleSeries, tatSeries } from "./series";

describe("series", () => {
  it("tatSeries keeps the 4 segments in legacy order and turns null into 0", () => {
    const s = tatSeries([
      { collection_reception: 3, reception_registration: null, registration_analysis: 5, analysis_validation: 1 },
    ]);
    expect(s.map((x) => x.name)).toEqual([
      "Colheita à Recepção",
      "Recepção ao Registo",
      "Registo à Análise",
      "Análise à Validação",
    ]);
    expect(s.map((x) => x.data[0])).toEqual([3, 0, 5, 1]);
  });
  it("cvSeries puts CV > 1000 first, CV < 1000 second", () => {
    const s = cvSeries([{ suppressed: 8, not_suppressed: 2 }]);
    expect(s.map((x) => [x.name, x.data[0], x.color])).toEqual([
      ["CV > 1000", 2, "#fb8c00"],
      ["CV < 1000", 8, "#ef5350"],
    ]);
  });
  it("genderSeries stacks men and women separately", () => {
    const s = genderSeries([{ male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 }]);
    expect(s.map((x) => [x.name, x.group, x.data[0]])).toEqual([
      ["Homens (CV < 1000)", "Homens", 1],
      ["Homens (CV > 1000)", "Homens", 2],
      ["Mulheres (CV < 1000)", "Mulheres", 3],
      ["Mulheres (CV > 1000)", "Mulheres", 4],
    ]);
  });
  it("chartToSheet writes one row per series under a label header", () => {
    const sheet = chartToSheet({ labels: ["A", "B"], series: singleSeries("Total", "#000", [1, 2]) }, "Província");
    expect(sheet).toEqual({ header: ["Província", "A", "B"], rows: [["Total", 1, 2]] });
  });
});
