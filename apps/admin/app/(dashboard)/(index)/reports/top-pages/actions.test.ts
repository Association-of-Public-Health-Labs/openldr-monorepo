import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGetList: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGetList: m.usageGetList }));

import { fetchData, toBars } from "./actions";

const filters = { range: { start: "2026-10-08", end: "2026-11-06" }, dashboard: "tb", label: "Últimos 30 dias" };
beforeEach(() => {
  m.usageGetList.mockReset();
});

describe("top pages", () => {
  it("asks for the top 5 with the dashboard filter", async () => {
    m.usageGetList.mockResolvedValue([]);
    await fetchData(filters, "tok");
    expect(m.usageGetList).toHaveBeenCalledWith("/top_pages/", { interval_dates: "2026-10-08,2026-11-06", dashboard: "tb", limit: 5 }, "tok");
  });
  it("labels pages with the dashboard name, calls / Sumário and scales bars to the top page", () => {
    const bars = toBars([
      { dashboard: "vl", page: "/", views: 2140 },
      { dashboard: "tb", page: "/lab", views: 1070 },
    ]);
    expect(bars[0]).toMatchObject({ label: "Carga Viral · Sumário", share: 100 });
    expect(bars[1]).toMatchObject({ label: "Tuberculose · /lab", share: 50 });
  });
  it("gives no bars for no data", () => {
    expect(toBars([])).toEqual([]);
  });
});
