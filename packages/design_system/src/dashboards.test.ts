import { describe, expect, it, vi } from "vitest";
import { DASHBOARDS, getDashboard, getDashboards, resolveUrl } from "./dashboards";

describe("dashboard registry", () => {
  it("lists VL, TB then EID with their colours and titles", () => {
    expect(DASHBOARDS.map((d) => [d.id, d.primary, d.primaryForeground])).toEqual([
      ["vl", "#00B000", "#FFFFFF"],
      ["tb", "#FF3030", "#FFFFFF"],
      ["eid", "#fda92d", "#1C252E"],
    ]);
    expect(getDashboard("eid", {}).portalTitle).toBe("Portal de DPI");
    expect(getDashboard("eid", {}).name).toBe("Diagnóstico Precoce Infantil");
    expect(getDashboard("vl", {}).portalTitle).toBe("Portal de Carga Viral");
    expect(getDashboard("tb", {}).portalTitle).toBe("Portal de Testagem Laboratorial de TB");
    expect(getDashboard("vl", {}).name).toBe("Carga Viral");
    expect(getDashboard("tb", {}).name).toBe("Tuberculose");
  });

  it("uses the production URLs by default", () => {
    expect(getDashboards({}).map((d) => d.url)).toEqual([
      "https://vl.openldr.org.mz",
      "https://tb.openldr.org.mz",
      "https://eid.openldr.org.mz",
    ]);
  });

  it("applies a valid override and drops a trailing slash", () => {
    expect(getDashboard("tb", { tb: "http://localhost:3001/" }).url).toBe("http://localhost:3001");
    expect(getDashboard("vl", { tb: "http://localhost:3001" }).url).toBe("https://vl.openldr.org.mz");
  });

  it("ignores a malformed override with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveUrl("https://tb.openldr.org.mz", "localhost:3001")).toBe("https://tb.openldr.org.mz");
    expect(resolveUrl("https://tb.openldr.org.mz", "ftp://x.org")).toBe("https://tb.openldr.org.mz");
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("treats an empty override as unset", () => {
    expect(resolveUrl("https://vl.openldr.org.mz", "")).toBe("https://vl.openldr.org.mz");
  });

  it("throws on an unknown id", () => {
    expect(() => getDashboard("cd4" as never, {})).toThrow("Unknown dashboard: cd4");
  });

  it("keeps EID hidden until it is released, with dark text on its primary", () => {
    expect(getDashboard("eid", {}).ready).toBe(false);
    expect(getDashboard("eid", {}).primaryForeground).toBe("#1C252E");
    expect(getDashboards({}).filter((d) => d.ready).map((d) => d.id)).toEqual(["vl", "tb"]);
  });
});
