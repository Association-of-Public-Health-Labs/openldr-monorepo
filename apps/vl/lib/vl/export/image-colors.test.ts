import { describe, expect, it } from "vitest";
import { hasModernColor, replaceModernColors } from "./image-colors";

describe("replaceModernColors", () => {
  it("replaces each oklch() occurrence and keeps the rest of the value", () => {
    const value = "oklch(0.2 0 0 / 0.1) 0px 1px 2px 0px, 0 4px 6px -1px oklch(0.5 0.1 200)";
    expect(replaceModernColors(value, (c) => `rgb(<${c}>)`)).toBe(
      "rgb(<oklch(0.2 0 0 / 0.1)>) 0px 1px 2px 0px, 0 4px 6px -1px rgb(<oklch(0.5 0.1 200)>)",
    );
  });
  it("replaces lab(), oklab(), lch() and color() too", () => {
    const value = "lab(50 20 30) oklab(0.5 0.1 0.1) lch(50 30 120) color(srgb 1 0 0)";
    expect(replaceModernColors(value, () => "X")).toBe("X X X X");
  });
  it("returns values without modern colours unchanged", () => {
    expect(replaceModernColors("none", () => "x")).toBe("none");
    expect(replaceModernColors("rgb(1, 2, 3)", () => "x")).toBe("rgb(1, 2, 3)");
  });
});

describe("hasModernColor", () => {
  it("detects modern colour functions only", () => {
    expect(hasModernColor("lab(29.2 -24.6 16.5)")).toBe(true);
    expect(hasModernColor("oklch(0.5 0.1 200)")).toBe(true);
    expect(hasModernColor("rgba(0, 0, 0, 0.5)")).toBe(false);
    expect(hasModernColor("none")).toBe(false);
  });
});
