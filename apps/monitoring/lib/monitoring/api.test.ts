import { afterEach, describe, expect, it, vi } from "vitest";
import { monitoringGet } from "./api";

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError("no body")) : Promise.resolve(body)),
  });

describe("monitoringGet", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls the same-origin route with the params, uncached", async () => {
    const fetch = respond(200, { ok: 1 });
    vi.stubGlobal("fetch", fetch);
    await expect(monitoringGet("/api/x", { a: "1", b: "x y" })).resolves.toEqual({ ok: 1 });
    expect(fetch).toHaveBeenCalledWith("/api/x?a=1&b=x+y", { cache: "no-store" });
  });

  it("calls without a query string when there are no params", async () => {
    const fetch = respond(200, []);
    vi.stubGlobal("fetch", fetch);
    await monitoringGet("/api/sites");
    expect(fetch).toHaveBeenCalledWith("/api/sites", { cache: "no-store" });
  });

  it("rejects with the route's error message", async () => {
    vi.stubGlobal("fetch", respond(502, { error: "DisaStatus 500" }));
    await expect(monitoringGet("/api/x")).rejects.toThrow("DisaStatus 500");
  });

  it("rejects with a Portuguese message when the error has no JSON body", async () => {
    vi.stubGlobal("fetch", respond(502, undefined));
    await expect(monitoringGet("/api/x")).rejects.toThrow("Não foi possível carregar os dados.");
  });

  it("rejects with the Portuguese message when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(monitoringGet("/api/x")).rejects.toThrow("Não foi possível carregar os dados.");
  });
});
