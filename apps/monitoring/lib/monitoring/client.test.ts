import { describe, it, expect, vi } from "vitest";
import { fetchAllSites, fetchConnectivityTrend, fetchFacilityMinutes, fetchOfflineMinutesByFacility, UPSTREAM_CONCURRENCY } from "./client";
import type { Host } from "./types";

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

describe("upstream requests", () => {
  const range = { startDate: "2025-01-01", endDate: "2025-12-31" };
  const ok = () => Promise.resolve({ ok: true, status: 200, json: async () => ({ data: [] }) } as Response);
  const status = (code: number) => Promise.resolve({ ok: false, status: code, json: async () => ({}) } as Response);

  it("shares one upstream call between concurrent identical requests", async () => {
    const fake = vi.fn(() => new Promise<Response>((r) => setTimeout(() => r(ok() as unknown as Response), 5)).then((x) => x));
    await Promise.all([
      fetchOfflineMinutesByFacility(["Gaza"], range, fake as unknown as typeof fetch),
      fetchOfflineMinutesByFacility(["Gaza"], range, fake as unknown as typeof fetch),
    ]);
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it("does not repeat a slow query after a gateway timeout", async () => {
    const fake = vi.fn(() => status(504));
    await expect(fetchOfflineMinutesByFacility(["Tete"], range, fake as unknown as typeof fetch)).rejects.toThrow("504");
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it("retries a fast server error once", async () => {
    const fake = vi.fn().mockImplementationOnce(() => status(500)).mockImplementationOnce(ok);
    await expect(fetchOfflineMinutesByFacility(["Sofala"], range, fake as unknown as typeof fetch)).resolves.toEqual([]);
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
    const facilities = Array.from({ length: 1100 }, (_, i) => `Site ${i}`);
    await fetchOfflineMinutesByFacility(facilities, range, fake as unknown as typeof fetch);
    expect(fake).toHaveBeenCalledTimes(22);
    expect(peak).toBeLessThanOrEqual(UPSTREAM_CONCURRENCY);
    expect(peak).toBeGreaterThan(1);
  });
});

describe("fetchFacilityMinutes", () => {
  const range = { startDate: "2025-11-16", endDate: "2026-11-16" };
  const host = (name: string | null, type: Host["type"] = "Disalab") =>
    ({ id: 1, code: "C", name, alias: null, teamviewer_id: "1", category: null, group_id: null, type, status: "Online", created_at: "", updated_at: "", ProvinceName: null, DistrictName: null }) as Host;

  it("returns offline minutes by site name", async () => {
    const fake = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ data: [{ healthFacility: "A", amount_of_time: 7 }] }) }) as Response);
    await expect(fetchFacilityMinutes([host("A")], range, fake as unknown as typeof fetch)).resolves.toEqual({ A: 7 });
  });

  it("asks with the same URLs whatever the host order, so every route shares the queries", async () => {
    const urls = (fake: ReturnType<typeof vi.fn>) => fake.mock.calls.map((c) => String(c[0])).sort();
    const make = () => vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ data: [] }) }) as Response);
    const a = make(), b = make();
    const hosts = [host("Zumbo"), host("Beira", "Disapoc"), host("Angoche", "Disalink"), host(null), host("Beira", "Disapoc"), host("X", null)];
    await fetchFacilityMinutes(hosts, range, a as unknown as typeof fetch);
    await fetchFacilityMinutes([...hosts].reverse(), range, b as unknown as typeof fetch);
    expect(urls(a)).toEqual(urls(b));
    expect(urls(a)[0]).toContain("healthFacilityName=Angoche&healthFacilityName=Beira&healthFacilityName=Zumbo&");
  });
});

describe("trend lane", () => {
  it("starts the trend query even while every shared slot is busy", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const fake = vi.fn(async (url: string) => {
      if (!url.includes("connectivity-trend")) await gate;
      return { ok: true, status: 200, json: async () => ({ data: url.includes("connectivity-trend") ? { labels: [], series: {} } : [] }) } as Response;
    });
    const busy = fetchOfflineMinutesByFacility(Array.from({ length: 50 * (UPSTREAM_CONCURRENCY + 2) }, (_, i) => `S${i}`), { startDate: "2025-01-01", endDate: "2025-12-31" }, fake as unknown as typeof fetch);
    await new Promise((r) => setTimeout(r, 5));
    await fetchConnectivityTrend(undefined, fake as unknown as typeof fetch);
    expect(fake.mock.calls.some((c) => String(c[0]).includes("connectivity-trend"))).toBe(true);
    release();
    await busy;
  });
});
