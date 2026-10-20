import { describe, expect, it } from "vitest";
import { SUPPRESSION_BANDS, formatRate, suppressionBand, suppressionRate } from "./suppression";

describe("suppressionRate", () => {
  it("is suppressed / (suppressed + not suppressed), unrounded", () => {
    expect(suppressionRate({ suppressed: 151709, not_suppressed: 13719 })).toBeCloseTo(91.7069, 3);
  });
  it("is null with no results", () => {
    expect(suppressionRate({ suppressed: 0, not_suppressed: 0 })).toBeNull();
    expect(suppressionRate(undefined)).toBeNull();
  });
});

describe("suppressionBand", () => {
  it.each([
    [79.9, "low", "#EF5350"],
    [80, "mid", "#FFAB00"],
    [89.96, "mid", "#FFAB00"],
    [90, "good", "#77ED8B"],
    [94.9, "good", "#77ED8B"],
    [95, "target", "#00B000"],
    [100, "target", "#00B000"],
    [null, "none", "#C4CDD5"],
  ] as const)("%s → %s", (rate, id, color) => {
    expect(suppressionBand(rate)).toMatchObject({ id, color });
  });
  it("lists the legend in order, with Portuguese labels", () => {
    expect(SUPPRESSION_BANDS.map((b) => b.label)).toEqual(["Meta (≥95%)", "Boa (90–94%)", "Média (80–89%)", "Baixa (<80%)", "Sem dados"]);
  });
});

describe("formatRate", () => {
  it("shows one decimal or a dash", () => {
    expect(formatRate(89.96)).toBe("90.0%");
    expect(formatRate(null)).toBe("—");
  });
});
