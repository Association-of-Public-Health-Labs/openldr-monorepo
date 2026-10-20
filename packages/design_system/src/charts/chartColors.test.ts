import { describe, expect, it } from "vitest";
import { DASHBOARDS } from "../dashboards";
import { chartColors } from "./chartColors";

describe("chartColors", () => {
  it.each(DASHBOARDS.map((d) => [d.id, d.primary] as const))("starts %s with its primary", (id, primary) => {
    const colors = chartColors(id);
    expect(colors).toHaveLength(8);
    expect(colors[0]).toBe(primary);
  });

  it("returns valid hex colours without duplicates", () => {
    for (const d of DASHBOARDS) {
      const colors = chartColors(d.id);
      colors.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
      expect(new Set(colors.map((c) => c.toLowerCase())).size).toBe(8);
    }
  });
});
