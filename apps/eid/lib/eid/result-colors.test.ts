import { describe, expect, it } from "vitest";
import { testedSeries } from "./lab-cards";
import { RESULT_COLORS } from "./series";
import { toChart as positivityChart } from "../../app/(dashboard)/(index)/reports/eid-positivity/actions";

describe("result colours on the charts", () => {
  it("lab tested cards: Positivo red, Negativo green", () => {
    const [pos, neg] = testedSeries([{ total: 10, positive: 2 }]);
    expect([pos.name, pos.color]).toEqual(["Positivo", RESULT_COLORS.positive]);
    expect([neg.name, neg.color]).toEqual(["Negativo", RESULT_COLORS.negative]);
  });

  it("Sumário positivity: the Positividade line is red", () => {
    const line = positivityChart([{ year: 2026, month: 3, month_name: "March", tested: 10, positive: 1, negative: 9, indeterminate: 0, conventional_positive: 1, poc_positive: 0, positivity: 10 }]).series.find((s) => s.name === "Positividade (%)");
    expect(line?.color).toBe(RESULT_COLORS.positive);
  });
});
