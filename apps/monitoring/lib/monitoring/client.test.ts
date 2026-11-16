import { describe, it, expect, vi } from "vitest";
import { fetchAllSites, fetchOfflineMinutesByDistrict, fetchOfflineMinutesByFacility, fetchOfflineMinutesByProvince } from "./client";

const page = (arr: unknown[]) => ({ ok: true, json: async () => ({ teamViewerHosts: arr }) }) as Response;

describe("fetchAllSites", () => {
  it("pages until an empty page", async () => {
    const fake = vi.fn()
      .mockResolvedValueOnce(page([{ id: 1 }, { id: 2 }]))
      .mockResolvedValueOnce(page([{ id: 3 }]))
      .mockResolvedValueOnce(page([]));
    const hosts = await fetchAllSites(fake as unknown as typeof fetch);
    expect(hosts).toHaveLength(3);
    expect(fake).toHaveBeenCalledTimes(3);
    expect(String(fake.mock.calls[0][0])).toContain("/teamviewer/sites");
  });
});

describe("fetchOfflineMinutesByFacility", () => {
  it("chunks names into groups of at most 50 per request", async () => {
    const names = Array.from({ length: 120 }, (_, i) => `Facility ${i}`);
    const fake = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) } as Response);

    const result = await fetchOfflineMinutesByFacility(
      names,
      { startDate: "2024-01-01", endDate: "2024-01-31" },
      fake as unknown as typeof fetch
    );

    expect(fake).toHaveBeenCalledTimes(3);
    expect(result).toEqual([]);

    const urls = fake.mock.calls.map((call) => String(call[0]));
    const countFacilityParams = (url: string) =>
      (url.match(/healthFacilityName=/g) ?? []).length;

    expect(countFacilityParams(urls[0])).toBe(50);
    expect(countFacilityParams(urls[1])).toBe(50);
    expect(countFacilityParams(urls[2])).toBe(20);
  });
});

// One name per request, all at once: DisaStatus answers a 12-province query in ~187 s but each
// province alone in 2–45 s, concurrently (measured 2026-11-16), so the joint query hit the timeout.
describe.each([
  ["province", fetchOfflineMinutesByProvince, "provinceName"],
  ["district", fetchOfflineMinutesByDistrict, "districtName"],
] as const)("fetchOfflineMinutesBy %s", (field, fn, param) => {
  it("sends one request per name and concatenates the rows", async () => {
    const fake = vi.fn((url: string) =>
      Promise.resolve({ ok: true, json: async () => ({ data: [{ [field]: decodeURIComponent(url.split(`${param}=`)[1].split("&")[0]), amount_of_time: 1 }] }) } as Response),
    );
    const rows = await fn(["A B", "C"], { startDate: "2025-01-01", endDate: "2025-12-31" }, fake as unknown as typeof fetch);
    expect(fake).toHaveBeenCalledTimes(2);
    for (const call of fake.mock.calls) expect((String(call[0]).match(new RegExp(`${param}=`, "g")) ?? []).length).toBe(1);
    expect(rows).toEqual([{ [field]: "A B", amount_of_time: 1 }, { [field]: "C", amount_of_time: 1 }]);
  });
});
