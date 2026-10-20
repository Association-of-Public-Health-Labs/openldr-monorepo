import { describe, expect, it } from "vitest";
// The module itself, not the MUI barrel (which touches `window`).
import { CATEGORY_WIDTH, chartMinWidth } from "../../../../../../design_system_mui/src/atoms/charts/apex/ChartScroller";

describe("chartMinWidth", () => {
  it("gives each category room for its label, plus the axes", () => {
    // 20 labs need more than a phone card (~300px), so their chart scrolls there.
    expect(chartMinWidth(20)).toBe(20 * CATEGORY_WIDTH + 96);
    expect(chartMinWidth(20)!).toBeGreaterThan(300);
    // Grouped bars ask for more per category.
    expect(chartMinWidth(5, 40)).toBe(5 * 40 + 96);
  });

  it("sets no minimum for a chart without categories", () => {
    expect(chartMinWidth(0)).toBeUndefined();
  });
});
