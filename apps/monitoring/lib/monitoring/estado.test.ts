import { describe, expect, it } from "vitest";
import { resolveEstado } from "./estado";
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
