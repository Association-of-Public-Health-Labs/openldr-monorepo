import { describe, expect, it } from "vitest";
import { CATEGORY_COLORS, MONITORING_PRIMARY, OFFLINE_COLOR, ONLINE_COLOR } from "./colors";

describe("category colours", () => {
  it("are distinct and never read as a status or the dashboard primary", () => {
    const colours = Object.values(CATEGORY_COLORS).map((c) => c.toLowerCase());
    expect(new Set(colours).size).toBe(colours.length);
    for (const reserved of [ONLINE_COLOR, OFFLINE_COLOR, MONITORING_PRIMARY]) expect(colours).not.toContain(reserved.toLowerCase());
  });
});
