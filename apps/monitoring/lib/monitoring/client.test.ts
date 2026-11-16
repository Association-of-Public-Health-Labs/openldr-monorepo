import { describe, it, expect, vi } from "vitest";
import { fetchAllSites, fetchOfflineMinutesByDistrict, fetchOfflineMinutesByFacility, fetchOfflineMinutesByProvince, UPSTREAM_CONCURRENCY } from "./client";

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

describe("upstream requests", () => {
  const range = { startDate: "2025-01-01", endDate: "2025-12-31" };
  const ok = () => Promise.resolve({ ok: true, status: 200, json: async () => ({ data: [] }) } as Response);
  const status = (code: number) => Promise.resolve({ ok: false, status: code, json: async () => ({}) } as Response);

  it("shares one upstream call between concurrent identical requests", async () => {
    const fake = vi.fn(() => new Promise<Response>((r) => setTimeout(() => r(ok() as unknown as Response), 5)).then((x) => x));
    await Promise.all([
      fetchOfflineMinutesByProvince(["Gaza"], range, fake as unknown as typeof fetch),
      fetchOfflineMinutesByProvince(["Gaza"], range, fake as unknown as typeof fetch),
    ]);
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it("does not repeat a slow query after a gateway timeout", async () => {
    const fake = vi.fn(() => status(504));
    await expect(fetchOfflineMinutesByProvince(["Tete"], range, fake as unknown as typeof fetch)).rejects.toThrow("504");
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it("retries a fast server error once", async () => {
    const fake = vi.fn().mockImplementationOnce(() => status(500)).mockImplementationOnce(ok);
    await expect(fetchOfflineMinutesByProvince(["Sofala"], range, fake as unknown as typeof fetch)).resolves.toEqual([]);
    expect(fake).toHaveBeenCalledTimes(2);
  });
});

describe("upstream concurrency", () => {
  // DisaStatus answers "Internal server error" when too many queries wait for its database pool
  // (22 at once on 2026-11-16: 7 failed together at ~11.9 s). Every route shares one cap.
  it(`never has more than ${UPSTREAM_CONCURRENCY} DisaStatus queries in flight`, async () => {
    let inFlight = 0;
    let peak = 0;
    const fake = vi.fn(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return { ok: true, status: 200, json: async () => ({ data: [] }) } as Response;
    });
    const range = { startDate: "2025-11-16", endDate: "2026-11-16" };
    const facilities = Array.from({ length: 500 }, (_, i) => `Site ${i}`);
    const provinces = Array.from({ length: 12 }, (_, i) => `Prov ${i}`);
    await Promise.all([
      fetchOfflineMinutesByFacility(facilities, range, fake as unknown as typeof fetch),
      fetchOfflineMinutesByProvince(provinces, range, fake as unknown as typeof fetch),
    ]);
    expect(fake).toHaveBeenCalledTimes(10 + 12);
    expect(peak).toBeLessThanOrEqual(UPSTREAM_CONCURRENCY);
    expect(peak).toBeGreaterThan(1);
  });
});
