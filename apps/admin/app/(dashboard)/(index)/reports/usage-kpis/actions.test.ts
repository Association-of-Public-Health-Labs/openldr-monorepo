import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGet: vi.fn(), countInactive: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGet: m.usageGet }));
vi.mock("@/app/(dashboard)/users/actions", () => ({ countInactive: m.countInactive }));

import { fetchData, toTiles } from "./actions";

const summary = { active_users: 142, sessions: 1284, sessions_per_user: 9.04, previous: { active_users: 131, sessions: 1223 } };
const filters = { range: { start: "2026-10-08", end: "2026-11-06" }, dashboard: "vl", label: "Últimos 30 dias" };

beforeEach(() => {
  m.usageGet.mockReset().mockResolvedValue(summary);
  m.countInactive.mockReset().mockResolvedValue(37);
});

describe("fetchData", () => {
  it("asks /summary/ for the period and dashboard, and counts users inactive for 90 days", async () => {
    const data = await fetchData(filters, "tok");
    expect(m.usageGet).toHaveBeenCalledWith("/summary/", { interval_dates: "2026-10-08,2026-11-06", dashboard: "vl" }, "tok");
    expect(m.countInactive).toHaveBeenCalledWith(90);
    expect(data).toEqual({ summary, inactive: 37 });
  });
  it("still returns the summary when counting inactive users fails", async () => {
    m.countInactive.mockRejectedValue(new Error("x"));
    expect((await fetchData(filters, null)).inactive).toBeNull();
  });
  it("lets a 403 from the API through", async () => {
    m.usageGet.mockRejectedValue(Object.assign(new Error("Acesso restrito a utilizadores com permissão de Administrador."), { status: 403 }));
    await expect(fetchData(filters, null)).rejects.toThrow(/Administrador/);
  });
});

describe("toTiles", () => {
  const tiles = toTiles({ summary, inactive: 37 }, "Últimos 30 dias");
  it("shows +8% for 142 against 131 and +5% for sessions", () => {
    expect(tiles[0]).toMatchObject({ key: "active", trend: { value: "+8%", good: true } });
    expect(tiles[1].trend?.value).toBe("+5%");
  });
  it("formats the average with a decimal comma and gives it no trend", () => {
    expect(tiles[2]).toMatchObject({ value: "9,0", trend: null });
  });
  it("has no trend when there was no previous period", () => {
    const t = toTiles({ summary: { ...summary, previous: { active_users: 0, sessions: 0 } }, inactive: 0 }, "x");
    expect(t[0].trend).toBeNull();
    expect(t[1].trend).toBeNull();
  });
  it("shows the inactive count, or a dash when it is unknown", () => {
    expect(tiles[3]).toMatchObject({ value: "37", subtitle: "sem acesso há mais de 90 dias" });
    expect(toTiles({ summary, inactive: null }, "x")[3].value).toBe("–");
  });
});
