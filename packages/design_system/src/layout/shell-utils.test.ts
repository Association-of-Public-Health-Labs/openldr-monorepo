import { describe, expect, it } from "vitest";
import { getDashboards } from "../dashboards";
import { headerTitle, initials, switcherItems } from "./shell-utils";

describe("switcherItems", () => {
  const dashboards = getDashboards({ tb: "http://localhost:3001" });
  // A registry where VL is not released yet.
  const unreleasedVl = dashboards.map((d) => (d.id === "vl" ? { ...d, ready: false } : d));

  it("lists every dashboard and marks the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.map((i) => [i.id, i.current])).toEqual([["vl", true], ["tb", false], ["eid", false]]);
  });
  it("links to the other dashboards with registry URLs and not to the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.find((i) => i.id === "tb")?.href).toBe("http://localhost:3001");
    expect(items.find((i) => i.id === "vl")?.href).toBeUndefined();
  });
  it("in production, a dashboard that isn't ready is shown disabled, without a link", () => {
    const vl = switcherItems("tb", unreleasedVl, true).find((i) => i.id === "vl");
    expect(vl).toMatchObject({ disabled: true, href: undefined });
  });
  it("in production, a released dashboard links normally", () => {
    expect(switcherItems("tb", dashboards, true).find((i) => i.id === "vl")).toMatchObject({ disabled: false });
  });
  it("outside production, or as the current dashboard, it stays usable", () => {
    expect(switcherItems("tb", unreleasedVl, false).find((i) => i.id === "vl")?.disabled).toBe(false);
    expect(switcherItems("vl", unreleasedVl, true).find((i) => i.id === "vl")).toMatchObject({ current: true, disabled: false });
  });
});

describe("headerTitle", () => {
  it("joins portal and page like today's header", () => {
    expect(headerTitle("Portal de Carga Viral", "Sumário")).toBe("Portal de Carga Viral - Sumário");
  });
  it("shows only the portal when the page is unknown", () => {
    expect(headerTitle("Portal de Carga Viral", undefined)).toBe("Portal de Carga Viral");
  });
});

describe("initials", () => {
  it("uses the first letter, like today's avatar", () => {
    expect(initials("vagner pene")).toBe("V");
    expect(initials("")).toBe("?");
  });
});
