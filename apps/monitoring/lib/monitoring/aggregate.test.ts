import { describe, it, expect } from "vitest";
import { countByCategory, categorySummary, offlineByKey, regionUptime, workingMinutes, PROVINCE_CODE } from "./aggregate";
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
describe("categorySummary downtimePct", () => {
  it("50% downtime when offline minutes equal half of capacity", () => {
    const hosts = [mk({ type: "Disalab" }), mk({ type: "Disalab" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" }; // 1 weekday, 480 min/host, cap=960
    const s = categorySummary(hosts, "Disalab", 480, range);
    expect(s.downtimePct).toBe(50);
    expect(s.total).toBe(2);
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
    const hosts = [mk({ ProvinceName: "Tete" }), mk({ ProvinceName: "Tete" })];
    const range = { startDate: "2025-08-04", endDate: "2025-08-04" };
    const out = regionUptime(hosts, (h) => normalizeProvince(h.ProvinceName), { Tete: 96 }, range); // cap 960, 10% down
    expect(out[0]).toMatchObject({ name: "Tete", code: "tt", hostCount: 2, uptimePct: 90 });
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
describe("offlineByKey", () => {
  it("sums grouped minutes under the normalised key and drops unknown names", () => {
    const stats = [
      { province: "Maputo Cidade", amount_of_time: 10 },
      { province: "Maputo-Cidade", amount_of_time: 5 },
      { province: "", amount_of_time: 7 },
    ];
    expect(offlineByKey(stats, "province", normalizeProvince)).toEqual({ "Maputo Cidade": 15 });
  });
});
