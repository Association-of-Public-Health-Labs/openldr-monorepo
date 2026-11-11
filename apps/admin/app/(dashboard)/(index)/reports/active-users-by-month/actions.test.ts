import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ usageGetList: vi.fn() }));
vi.mock("@/lib/admin/usage-api", () => ({ usageGetList: m.usageGetList }));

import { fetchData, toChart, toExcel } from "./actions";

beforeEach(() => {
  m.usageGetList.mockReset();
});

describe("fetchData", () => {
  it("always asks for the last 12 months", async () => {
    m.usageGetList.mockResolvedValue([]);
    const data = await fetchData("tok", new Date(2026, 10, 6));
    expect(m.usageGetList).toHaveBeenCalledWith("/active_users_by_month/", { interval_dates: "2025-12-01,2026-11-06" }, "tok");
    expect(data.months).toHaveLength(12);
  });
});

describe("toChart", () => {
  const rows = [
    { year: 2026, month: 10, dashboard: "vl", active_users: 7 },
    { year: 2026, month: 11, dashboard: "vl", active_users: 9 },
    { year: 2026, month: 11, dashboard: "tb", active_users: 4 },
  ];
  it("starts a dashboard's line when its tracking began: earlier months are null", async () => {
    m.usageGetList.mockResolvedValue(rows);
    const chart = toChart(await fetchData(null, new Date(2026, 10, 6)));
    const tb = chart.series.find((s) => s.name === "Tuberculose")!;
    expect(tb.data.slice(0, 11).every((v) => v === null)).toBe(true);
    expect(tb.data[11]).toBe(4);
    expect(chart.series.find((s) => s.name === "Carga Viral")!.color).toBe("#00B000");
    expect(chart.labels[11]).toBe("Nov/26");
  });
  it("gives no series, so the card shows its empty state, for no rows", async () => {
    m.usageGetList.mockResolvedValue([]);
    expect(toChart(await fetchData(null, new Date(2026, 10, 6))).series).toEqual([]);
  });
  it("leaves empty cells in the Excel sheet for months without data", async () => {
    m.usageGetList.mockResolvedValue(rows);
    const sheet = toExcel(await fetchData(null, new Date(2026, 10, 6)));
    expect(sheet.header).toHaveLength(13);
    expect(sheet.rows[1].slice(1, 3)).toEqual(["", ""]);
  });
});
