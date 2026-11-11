import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGetList: vi.fn(), resolveUsers: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGetList: m.usageGetList }));
vi.mock("@/app/(dashboard)/users/actions", () => ({ resolveUsers: m.resolveUsers }));

import { fetchData, toTable } from "./actions";

const filters = { range: { start: "2026-10-08", end: "2026-11-06" }, dashboard: undefined, label: "Últimos 30 dias" };
const now = new Date(2026, 10, 6, 15, 0);
const rows = [
  { user_id: "u1", dashboards: ["vl", "eid"], sessions: 64, last_visit: new Date(2026, 10, 6, 9, 0).toISOString() },
  { user_id: "gone", dashboards: ["tb"], sessions: 51, last_visit: new Date(2026, 10, 5, 9, 0).toISOString() },
];

beforeEach(() => {
  m.usageGetList.mockReset().mockResolvedValue(rows);
  m.resolveUsers.mockReset().mockResolvedValue({ u1: { name: "Ana Exemplo", email: "ana@x.org" } });
});

describe("top users", () => {
  it("asks for the top 10 of the period, with the dashboard filter when set", async () => {
    await fetchData({ ...filters, dashboard: "vl" }, "tok");
    expect(m.usageGetList).toHaveBeenCalledWith("/top_users/", { interval_dates: "2026-10-08,2026-11-06", dashboard: "vl", limit: 10 }, "tok");
    expect(m.resolveUsers).toHaveBeenCalledWith(["u1", "gone"]);
  });
  it("names users, links to the Users page panel and shows an unresolved id as Utilizador removido", async () => {
    const t = toTable(await fetchData(filters, null), now);
    expect(t[0]).toMatchObject({ name: "Ana Exemplo", href: "/users?user=u1", tags: ["CV", "DPI"], lastVisit: "Hoje" });
    expect(t[1]).toMatchObject({ name: "Utilizador removido", lastVisit: "Ontem" });
  });
  it("keeps the ranking when the name lookup fails", async () => {
    m.resolveUsers.mockRejectedValue(new Error("x"));
    const t = toTable(await fetchData(filters, null), now);
    expect(t.map((r) => r.name)).toEqual(["Utilizador removido", "Utilizador removido"]);
  });
  it("leaves admin out of the dashboard tags", async () => {
    m.usageGetList.mockResolvedValue([{ user_id: "u1", dashboards: ["admin", "vl"], sessions: 1, last_visit: null }]);
    expect(toTable(await fetchData(filters, null))[0].tags).toEqual(["CV"]);
  });
  it("gives no rows for no data", async () => {
    m.usageGetList.mockResolvedValue([]);
    expect(toTable(await fetchData(filters, null))).toEqual([]);
    expect(m.resolveUsers).not.toHaveBeenCalled();
  });
});
