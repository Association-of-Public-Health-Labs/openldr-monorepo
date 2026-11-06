import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// No DOM in this package's test setup: a minimal hook runtime (refs by slot, effects on dep change).
const rt = vi.hoisted(() => ({
  refs: [] as { current: unknown }[],
  deps: [] as (unknown[] | undefined)[],
  pending: [] as (() => void)[],
  refIdx: 0,
  effIdx: 0,
}));
vi.mock("react", () => ({
  useRef: (init: unknown) => {
    const i = rt.refIdx++;
    rt.refs[i] ??= { current: init };
    return rt.refs[i];
  },
  useEffect: (fn: () => void, deps: unknown[]) => {
    const i = rt.effIdx++;
    const prev = rt.deps[i];
    if (!prev || deps.some((d, k) => !Object.is(d, prev[k]))) {
      rt.deps[i] = deps;
      rt.pending.push(fn);
    }
  },
}));

import { useUsageBeacon } from "./use-usage-beacon";

function render(pathname: string, getToken: () => Promise<string | null>, ready: boolean) {
  rt.refIdx = 0;
  rt.effIdx = 0;
  useUsageBeacon("vl", pathname, getToken, ready);
  const run = rt.pending.splice(0);
  run.forEach((fn) => fn());
}
const settle = () => new Promise((r) => setTimeout(r, 0));

const fetchMock = vi.fn();
beforeEach(() => {
  rt.refs = [];
  rt.deps = [];
  rt.pending = [];
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 204 });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_OPENLDR_API", "https://api.test");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const token = () => Promise.resolve("tok");

describe("useUsageBeacon", () => {
  it("sends nothing until ready, then once", async () => {
    render("/lab", token, false);
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
    render("/lab", token, true);
    await settle();
    render("/lab", token, true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ dashboard: "vl", page: "/lab" });
  });

  it("sends nothing with a null token, and a later ready re-run still sends", async () => {
    render("/lab", () => Promise.resolve(null), true);
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
    render("/lab", () => Promise.resolve(null), false);
    render("/lab", token, true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends once per path change", async () => {
    render("/lab", token, true);
    await settle();
    render("/clinic?x=1", token, true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).page).toBe("/clinic");
  });

  it("does not re-send for a new getToken identity", async () => {
    render("/lab", token, true);
    await settle();
    render("/lab", () => Promise.resolve("tok"), true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not mark the page as sent after a failed send", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    render("/lab", token, true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    render("/lab", token, false);
    render("/lab", token, true);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not start a second send for a page already in flight", async () => {
    let release: (v: string) => void = () => {};
    const slow = () => new Promise<string>((r) => (release = r));
    render("/lab", slow, true);
    render("/lab", slow, false);
    render("/lab", slow, true);
    release("tok");
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
