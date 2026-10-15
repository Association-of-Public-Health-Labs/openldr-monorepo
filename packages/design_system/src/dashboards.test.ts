import { describe, expect, it, vi } from "vitest";
import { DASHBOARDS, getDashboard, getDashboards, resolveUrl } from "./dashboards";

describe("dashboard registry", () => {
  it("lists VL then TB with their colours and titles", () => {
    expect(DASHBOARDS.map((d) => [d.id, d.primary, d.primaryForeground])).toEqual([
      ["vl", "#00B000", "#FFFFFF"],
      ["tb", "#F8A200", "#1A1A1A"],
    ]);
    expect(getDashboard("vl", {}).portalTitle).toBe("Portal de Carga Viral");
    expect(getDashboard("tb", {}).portalTitle).toBe("Portal de Testagem Laboratorial de TB");
    expect(getDashboard("vl", {}).name).toBe("Carga Viral");
    expect(getDashboard("tb", {}).name).toBe("Tuberculose");
  });

  it("uses the production URLs by default", () => {
    expect(getDashboards({}).map((d) => d.url)).toEqual([
      "https://vl.openldr.org.mz",
      "https://tb.openldr.org.mz",
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
    expect(() => getDashboard("eid" as never, {})).toThrow("Unknown dashboard: eid");
  });
});
