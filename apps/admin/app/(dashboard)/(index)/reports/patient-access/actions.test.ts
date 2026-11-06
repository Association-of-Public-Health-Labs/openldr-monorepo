import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGetList: vi.fn(), resolveUsers: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGetList: m.usageGetList }));
vi.mock("@/app/(dashboard)/users/actions", () => ({ resolveUsers: m.resolveUsers }));

import { fetchData, toTable } from "./actions";

const filters = { range: { start: "2026-10-08", end: "2026-11-06" }, dashboard: undefined, label: "Últimos 30 dias" };
beforeEach(() => {
  m.usageGetList.mockReset();
  m.resolveUsers.mockReset().mockImplementation(async (ids: string[]) => Object.fromEntries(ids.filter((i) => i !== "gone").map((i) => [i, { name: `Nome ${i}`, email: "" }])));
});

describe("patient access", () => {
  it("names users, shows the dashboard name, and an unresolved id as Utilizador removido", async () => {
    m.usageGetList.mockResolvedValue([
      { user_id: "u1", dashboard: "vl", accesses: 28, last_access: new Date(2026, 10, 5, 14, 32).toISOString() },
      { user_id: "gone", dashboard: "eid", accesses: 2, last_access: null },
    ]);
    const t = toTable(await fetchData(filters, "tok"));
    expect(m.usageGetList).toHaveBeenCalledWith("/patient_access/", { interval_dates: "2026-10-08,2026-11-06", dashboard: undefined }, "tok");
    expect(t[0]).toMatchObject({ name: "Nome u1", dashboard: "Carga Viral", accesses: "28", lastAccess: "05 Nov 2026, 14:32" });
    expect(t[1]).toMatchObject({ name: "Utilizador removido", dashboard: "Diagnóstico Precoce Infantil", lastAccess: "–" });
  });
  it("resolves names 100 at a time", async () => {
    m.usageGetList.mockResolvedValue(Array.from({ length: 150 }, (_, i) => ({ user_id: `u${i}`, dashboard: "vl", accesses: 1, last_access: null })));
    await fetchData(filters, null);
    expect(m.resolveUsers.mock.calls.map((c) => c[0].length)).toEqual([100, 50]);
  });
  it("gives no rows for no data", async () => {
    m.usageGetList.mockResolvedValue([]);
    expect(toTable(await fetchData(filters, null))).toEqual([]);
  });
});
