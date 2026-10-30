import { describe, expect, it } from "vitest";
import { muiThemeOptions } from "./muiThemeOptions";

function withoutPrimary(options: Record<string, any>) {
  const { primary, ...palette } = options.palette;
  return { ...options, palette };
}

describe("muiThemeOptions", () => {
  it("uses the dashboard primary", () => {
    expect(muiThemeOptions("vl", "light").palette.primary.main).toBe("#00B000");
    expect(muiThemeOptions("tb", "light").palette.primary.main).toBe("#FF3030");
    expect(muiThemeOptions("tb", "dark").palette.primary.main).toBe("#FF3030");
  });

  it("differs between dashboards only in the primary", () => {
    for (const mode of ["light", "dark"] as const) {
      expect(withoutPrimary(muiThemeOptions("vl", mode))).toEqual(withoutPrimary(muiThemeOptions("tb", mode)));
    }
  });

  it("keeps today's light theme values", () => {
    const t = muiThemeOptions("vl", "light");
    expect(t.palette.mode).toBe("light");
    expect(t.palette.secondary.main).toBe("#F8A200");
    expect(t.palette.error.main).toBe("#EF5350");
    expect(t.palette.success.main).toBe("#00B000");
    expect(t.palette.warning.main).toBe("#F8A200");
    expect(t.palette.info.main).toBe("#6B52DC");
    expect(t.palette.background).toEqual({ paper: "#fff", default: "#f4f4f4" });
    expect(t.palette.text.primary).toBe("#333333");
    expect(t.palette.divider).toBe("#e5e5e5");
    expect(t.components.MuiCard.styleOverrides.root.borderRadius).toBe("16px");
    // Today's theme lists 3 shadows plus 23 "none" (26 entries); kept as is.
    expect(t.shadows).toHaveLength(26);
    expect(t.typography.fontFamily).toBe('"Open Sans", "Nunito Sans", sans-serif');
    expect(t.shape.borderRadius).toBe(4);
  });

  it("keeps today's dark theme values", () => {
    const t = muiThemeOptions("vl", "dark");
    expect(t.palette.mode).toBe("dark");
    expect(t.palette.background).toEqual({ paper: "#1d232a", default: "#141a21" });
    expect(t.palette.text.primary).toBe("#fff");
    expect(t.palette.divider).toBe("rgba(145, 158, 171, 0.24)");
    expect(t.components).toBeUndefined();
    expect(t.shadows).toBeUndefined();
  });

  it("returns a fresh object each call", () => {
    const a = muiThemeOptions("vl", "light");
    a.palette.primary.main = "#000";
    expect(muiThemeOptions("vl", "light").palette.primary.main).toBe("#00B000");
  });
});
