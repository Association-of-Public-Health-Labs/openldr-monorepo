import { describe, expect, it } from "vitest";
import { getDashboards } from "../dashboards";
import { headerTitle, initials, readSidebarOpen, switcherItems } from "./shell-utils";

describe("readSidebarOpen", () => {
  it("is collapsed by default", () => {
    expect(readSidebarOpen("")).toBe(false);
    expect(readSidebarOpen("other=1")).toBe(false);
  });
  it("reads the shadcn sidebar cookie", () => {
    expect(readSidebarOpen("a=1; sidebar_state=true; b=2")).toBe(true);
    expect(readSidebarOpen("sidebar_state=false")).toBe(false);
  });
});

describe("switcherItems", () => {
  const dashboards = getDashboards({ tb: "http://localhost:3001" });

  it("lists every dashboard and marks the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.map((i) => [i.id, i.current])).toEqual([["vl", true], ["tb", false]]);
  });
  it("links to the other dashboards with registry URLs and not to the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.find((i) => i.id === "tb")?.href).toBe("http://localhost:3001");
    expect(items.find((i) => i.id === "vl")?.href).toBeUndefined();
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
