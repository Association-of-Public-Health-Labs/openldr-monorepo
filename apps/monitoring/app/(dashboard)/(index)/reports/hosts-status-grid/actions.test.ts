import { describe, expect, it, vi } from "vitest";
import type { Host } from "@/lib/monitoring/types";

vi.mock("@/lib/monitoring/api", () => ({ monitoringGet: vi.fn() }));
import { hostsForTab, toExcel } from "./actions";

let id = 0;
const host = (over: Partial<Host>): Host => ({
  id: ++id, code: `C${id}`, name: `Site ${id}`, alias: null, teamviewer_id: "1", category: null, group_id: null,
  type: "Disalab", status: "Online", created_at: "", updated_at: "", ProvinceName: "Tete", DistrictName: "Moatize", ...over,
});

describe("hosts-status-grid actions", () => {
  const hosts = [
    host({ name: "Zumbo", status: "Online" }),
    host({ name: "Ângonia", status: "Offline" }),
    host({ name: "Beira", status: "Offline" }),
    host({ name: "Chimoio", status: "Online", type: "Disapoc" }),
    host({ name: "Dondo", status: "Offline", type: "Disalink", code: null }),
  ];

  it("filters by category, offline first, then by name in Portuguese order", () => {
    expect(hostsForTab(hosts, "Disalab", null).map((h) => h.name)).toEqual(["Ângonia", "Beira", "Zumbo"]);
  });

  it("keeps every category on Todos and applies the limit", () => {
    expect(hostsForTab(hosts, "all", null)).toHaveLength(5);
    expect(hostsForTab(hosts, "all", 2).map((h) => h.name)).toEqual(["Ângonia", "Beira"]);
  });

  it("keeps hosts without a code", () => {
    expect(hostsForTab(hosts, "Disalink", null).map((h) => h.code)).toEqual([null]);
  });

  it("exports the tab's hosts with Portuguese headers", () => {
    const sheet = toExcel(hostsForTab(hosts, "Disalink", null));
    expect(sheet.header).toEqual(["Código", "Nome", "Categoria", "Província", "Distrito", "Estado"]);
    expect(sheet.rows).toEqual([["", "Dondo", "DisaLink", "Tete", "Moatize", "Offline"]]);
  });
});
