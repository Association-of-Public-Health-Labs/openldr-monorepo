import { describe, it, expect } from "vitest";
import { capacityMinutes, countByCategory, categorySummary, offlineByHostGroup, regionUptime, workingMinutes, PROVINCE_CODE } from "./aggregate";
import { normalizeProvince } from "./regions";
import type { Host } from "./types";

const mk = (over: Partial<Host>): Host => ({ id: 1, code: "C", name: "N", alias: null,
  teamviewer_id: "1", category: null, group_id: null, type: "Disalab", status: "Online",
  created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z",
  ProvinceName: "Tete", DistrictName: "Moatize", ...over });

describe("countByCategory", () => {
  const hosts = [mk({ type: "Disalab", status: "Online" }), mk({ type: "Disalab", status: "Offline" }),
    mk({ type: "Disapoc", status: "Offline" })];
  it("counts a single type", () => {
    expect(countByCategory(hosts, "Disalab")).toEqual({ total: 2, online: 1, offline: 1 });
  });
  it("counts all", () => {
    expect(countByCategory(hosts, "all")).toEqual({ total: 3, online: 1, offline: 2 });
  });
});
describe("workingMinutes", () => {
  it("one weekday = 480 minutes", () => {
    expect(workingMinutes({ startDate: "2025-08-04", endDate: "2025-08-04" })).toBe(480); // Monday
  });
  it("excludes weekend", () => {
    expect(workingMinutes({ startDate: "2025-08-09", endDate: "2025-08-10" })).toBe(0); // Sat+Sun
  });
});
describe("capacityMinutes", () => {
  // DisaStatus counts Disalab outages around the clock and DisaPoC/DisaLink ones only in working hours.
  const monday = { startDate: "2025-08-04", endDate: "2025-08-04" };
  const weekend = { startDate: "2025-08-09", endDate: "2025-08-10" };
  it("gives Disalab the whole day, every day", () => {
    expect(capacityMinutes("Disalab", monday)).toBe(1440);
    expect(capacityMinutes("Disalab", weekend)).toBe(2880);
  });
  it("gives DisaPoC and DisaLink working hours only", () => {
    expect(capacityMinutes("Disapoc", monday)).toBe(480);
    expect(capacityMinutes("Disalink", weekend)).toBe(0);
  });
});
describe("categorySummary downtimePct", () => {
  it("50% downtime for Disalab against round-the-clock capacity", () => {
    const hosts = [mk({ type: "Disalab" }), mk({ type: "Disalab" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // 1 day, 1440 min/host, cap=2880
    const s = categorySummary(hosts, "Disalab", 1440, range);
    expect(s.downtimePct).toBe(50);
    expect(s.total).toBe(2);
  });
  it("50% downtime for DisaPoC against working-hours capacity", () => {
    const hosts = [mk({ type: "Disapoc" }), mk({ type: "Disapoc" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // 480 min/host, cap=960
    expect(categorySummary(hosts, "Disapoc", 480, range).downtimePct).toBe(50);
  });
  it("sums each host's own capacity for Todos", () => {
    const hosts = [mk({ type: "Disalab" }), mk({ type: "Disapoc" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // cap = 1440 + 480 = 1920
    expect(categorySummary(hosts, "all", 960, range).downtimePct).toBe(50);
  });
  it("clamps downtimePct at 100 when offline exceeds capacity", () => {
    const hosts = [mk({ type: "Disalab" })]; // 1 host
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // 1 weekday, cap = 480
    const s = categorySummary(hosts, "Disalab", 9999, range); // offline >> capacity
    expect(s.downtimePct).toBe(100);
  });
});
describe("regionUptime", () => {
  it("computes per-province uptime and code", () => {
    const hosts = [mk({ ProvinceName: "Tete", type: "Disapoc" }), mk({ ProvinceName: "Tete", type: "Disapoc" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" };
    const out = regionUptime(hosts, (h) => normalizeProvince(h.ProvinceName), { Tete: 96 }, range); // cap 960, 10% down
    expect(out[0]).toMatchObject({ name: "Tete", code: "tt", hostCount: 2, uptimePct: 90 });
  });
  it("uses each host type's capacity", () => {
    const hosts = [mk({ ProvinceName: "Tete", type: "Disalab" }), mk({ ProvinceName: "Tete", type: "Disalink" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // cap 1440 + 480 = 1920
    expect(regionUptime(hosts, (h) => h.ProvinceName, { Tete: 192 }, range)[0].uptimePct).toBe(90);
  });
  it("merges spelling variants under one key and skips hosts without one", () => {
    const hosts = [mk({ ProvinceName: "Maputo Cidade" }), mk({ ProvinceName: "Maputo-Cidade" }), mk({ ProvinceName: "" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" };
    const out = regionUptime(hosts, (h) => normalizeProvince(h.ProvinceName), { "Maputo Cidade": 0 }, range);
    expect(out).toEqual([{ name: "Maputo Cidade", code: "mc", hostCount: 2, uptimePct: 100 }]);
  });
});
describe("PROVINCE_CODE", () => {
  it("maps names to SvgMap short codes", () => {
    expect(PROVINCE_CODE["Cabo Delgado"]).toBe("cd");
    expect(PROVINCE_CODE["Maputo Cidade"]).toBe("mc");
  });
});
describe("offlineByHostGroup", () => {
  // One per-site query feeds the summary, the province map and the district map.
  const minutes = { "HG Tete": 100, "CS Moatize": 50, "HC Beira": 30 };
  const hosts = [
    mk({ name: "HG Tete", ProvinceName: "Tete", type: "Disalab" }),
    mk({ name: "CS Moatize", ProvinceName: "Tete", type: "Disapoc" }),
    mk({ name: "HC Beira", ProvinceName: "Sofala", type: "Disalab" }),
    mk({ name: "Sem dados", ProvinceName: "Sofala", type: "Disalink" }),
  ];
  it("sums each site's offline minutes under its group", () => {
    expect(offlineByHostGroup(hosts, minutes, (h) => h.ProvinceName)).toEqual({ Tete: 150, Sofala: 30 });
    expect(offlineByHostGroup(hosts, minutes, (h) => h.type)).toEqual({ Disalab: 130, Disapoc: 50 });
  });
  it("counts a name once per group (DisaStatus already merges sites with the same name)", () => {
    const twins = [mk({ name: "HG Tete", ProvinceName: "Tete" }), mk({ name: "HG Tete", ProvinceName: "Tete" })];
    expect(offlineByHostGroup(twins, minutes, (h) => h.ProvinceName)).toEqual({ Tete: 100 });
  });
  it("skips sites without a group", () => {
    expect(offlineByHostGroup([mk({ name: "HG Tete", ProvinceName: "" })], minutes, (h) => normalizeProvince(h.ProvinceName))).toEqual({});
  });
});
