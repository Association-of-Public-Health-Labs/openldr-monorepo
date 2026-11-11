import { describe, expect, it, vi } from "vitest";
import { pagePath, sendPageView, shouldSend } from "./usage-beacon";

describe("pagePath", () => {
  it("drops any query or hash", () => {
    expect(pagePath("/lab?name=Ana#x")).toBe("/lab");
    expect(pagePath("/lab#x")).toBe("/lab");
    expect(pagePath("/")).toBe("/");
  });
});

describe("shouldSend", () => {
  it("sends the first page", () => {
    expect(shouldSend(null, "/lab")).toBe(true);
  });
  it("does not repeat the same path", () => {
    expect(shouldSend("/lab", "/lab")).toBe(false);
  });
  it("sends when the path changes", () => {
    expect(shouldSend("/lab", "/clinic")).toBe(true);
  });
});

describe("sendPageView", () => {
  const base = { apiBase: "https://api.test", token: "tok", dashboard: "vl" as const, page: "/lab" };

  it("posts the page view with the token and keepalive", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await expect(sendPageView({ ...base, fetchFn })).resolves.toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://api.test/usage/events");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ dashboard: "vl", page: "/lab" });
  });

  it("resolves when fetch rejects", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("offline"));
    await expect(sendPageView({ ...base, fetchFn })).resolves.toBe(false);
  });

  it("resolves when the API answers 500", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(sendPageView({ ...base, fetchFn })).resolves.toBe(false);
  });

  it("sends nothing without a token", async () => {
    const fetchFn = vi.fn();
    await expect(sendPageView({ ...base, token: null, fetchFn })).resolves.toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
