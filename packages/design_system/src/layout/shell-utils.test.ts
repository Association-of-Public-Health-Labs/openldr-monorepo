import { describe, expect, it } from "vitest";
import { getDashboards } from "../dashboards";
import type { UserAccess } from "../lib/access";
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

describe("switcherItems with access", () => {
  const dashboards = getDashboards({});
  const ids = (items: { id: string }[]) => items.map((i) => i.id);
  const user = (over: Partial<UserAccess>): UserAccess => ({ dashboards: ["vl", "tb", "eid"], patientData: false, admin: false, ...over });

  it("hides admin without access info", () => {
    expect(ids(switcherItems("vl", dashboards, false))).not.toContain("admin");
    expect(ids(switcherItems("vl", dashboards, false, null))).not.toContain("admin");
  });
  it("hides admin for a non-admin", () => {
    expect(ids(switcherItems("vl", dashboards, false, user({})))).toEqual(["vl", "tb", "eid"]);
  });
  it("shows admin for an admin", () => {
    expect(ids(switcherItems("vl", dashboards, false, user({ admin: true })))).toContain("admin");
  });
  it("a user with only tb sees tb plus the current one", () => {
    expect(ids(switcherItems("vl", dashboards, false, user({ dashboards: ["tb"] })))).toEqual(["vl", "tb"]);
  });
  it("keeps the current dashboard even when not allowed", () => {
    expect(ids(switcherItems("admin", dashboards, false, user({ dashboards: ["tb"] })))).toEqual(["tb", "admin"]);
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
