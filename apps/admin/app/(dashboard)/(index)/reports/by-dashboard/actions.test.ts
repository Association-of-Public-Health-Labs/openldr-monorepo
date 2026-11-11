import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGetList: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGetList: m.usageGetList }));

import { fetchData, toExcel, toTable } from "./actions";

const filters = { range: { start: "2026-10-08", end: "2026-11-06" }, dashboard: "vl", label: "Últimos 30 dias" };
const rows = [
  { dashboard: "tb", active_users: 71, sessions: 384, sessions_per_user: 5.4 },
  { dashboard: "vl", active_users: 96, sessions: 1702, sessions_per_user: 17.7 },
  { dashboard: "admin", active_users: 2, sessions: 3, sessions_per_user: 1.5 },
];

beforeEach(() => {
  m.usageGetList.mockReset();
});

describe("by dashboard", () => {
  it("sends the period only: the API has no dashboard filter here", async () => {
    m.usageGetList.mockResolvedValue(rows);
    await fetchData(filters, "tok");
    expect(m.usageGetList).toHaveBeenCalledWith("/by_dashboard/", { interval_dates: "2026-10-08,2026-11-06" }, "tok");
  });
  it("orders rows like the registry, names them from it, leaves out admin and formats numbers", () => {
    const t = toTable(rows);
    expect(t.map((r) => r.name)).toEqual(["Carga Viral", "Tuberculose"]);
    expect(t[0]).toMatchObject({ color: "#00B000", sessions: expect.stringMatching(/^1\s702$/), perUser: "17,7" });
  });
  it("gives no rows, so the card shows its empty state, for no data", () => {
    expect(toTable([])).toEqual([]);
    expect(toExcel([]).rows).toEqual([]);
  });
});
