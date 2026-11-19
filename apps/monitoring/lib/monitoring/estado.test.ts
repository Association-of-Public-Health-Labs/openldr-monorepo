import { describe, expect, it } from "vitest";
import { estadoLoading, resolveEstado } from "./estado";
import type { Host } from "./types";

const host = (code: string | null, name: string): Host => ({
  id: 1, code, name, alias: null, teamviewer_id: "1", category: null, group_id: null, type: "Disalab", status: "Online",
  created_at: "", updated_at: "", ProvinceName: null, DistrictName: null,
});

describe("resolveEstado", () => {
  const hosts = [host("Z1", "Zumbo"), host(null, "Ângonia"), host("B1", "Beira")];

  it("redirects to the first host with a code, by name, when no code is given", () => {
    expect(resolveEstado(null, hosts)).toEqual({ kind: "redirect", code: "B1" });
  });
  it("shows a known code", () => {
    expect(resolveEstado("Z1", hosts)).toEqual({ kind: "show", code: "Z1" });
  });
  it("reports an unknown code as not found", () => {
    expect(resolveEstado("DOESNOTEXIST", hosts)).toEqual({ kind: "not-found" });
  });
  it("is empty when there are no hosts with a code", () => {
    expect(resolveEstado(null, [])).toEqual({ kind: "empty" });
    expect(resolveEstado(null, [host(null, "X")])).toEqual({ kind: "empty" });
  });
});

describe("estadoLoading", () => {
  const base = { sitesLoading: false, view: { kind: "show", code: "A" } as const, detailLoading: false, detailError: null, hasDetail: true };
  it("is not loading once the site's detail is in", () => {
    expect(estadoLoading(base)).toBe(false);
  });
  it("loads while the sites or the detail are on their way", () => {
    expect(estadoLoading({ ...base, sitesLoading: true })).toBe(true);
    expect(estadoLoading({ ...base, detailLoading: true })).toBe(true);
    expect(estadoLoading({ ...base, hasDetail: false })).toBe(true);
  });
  it("stops loading on a detail error, so the cards show it with Tentar novamente", () => {
    expect(estadoLoading({ ...base, hasDetail: false, detailError: "DisaStatus 504" })).toBe(false);
  });
  it("keeps loading while redirecting to the first site (no empty flash)", () => {
    expect(estadoLoading({ ...base, view: { kind: "redirect", code: "B" }, hasDetail: false })).toBe(true);
  });
  it("never loads for an unknown or empty site list", () => {
    expect(estadoLoading({ ...base, view: { kind: "not-found" }, hasDetail: false })).toBe(false);
    expect(estadoLoading({ ...base, view: { kind: "empty" }, hasDetail: false })).toBe(false);
  });
});
