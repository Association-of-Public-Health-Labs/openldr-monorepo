import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConnectivityTrend, NationalSummary } from "@/lib/monitoring/types";

const get = vi.fn();
vi.mock("@/lib/monitoring/api", () => ({ monitoringGet: (...a: unknown[]) => get(...a) }));

import { fetchData, monthLabel, toTiles } from "./actions";

const cat = (type: NationalSummary["categories"][number]["type"], offline: number, total: number, downtimePct: number) =>
  ({ type, label: type, total, offline, online: total - offline, downtimePct, trend: [] });
const summary: NationalSummary = {
  categories: [cat("all", 383, 422, 12), cat("Disalab", 10, 23, 8), cat("Disapoc", 180, 192, 15), cat("Disalink", 193, 207, 11)],
  uptimePct: 88,
  downtimePct: 12,
};
const trend: ConnectivityTrend = {
  labels: ["2025-12", "2026-01"],
  series: { all: [90, 85], Disalab: [95, 96], Disapoc: [80, 81], Disalink: [88, 87] },
};

describe("category-kpis actions", () => {
  afterEach(() => get.mockReset());

  it("builds the four tiles in order with value, subtitle and colour", () => {
    const tiles = toTiles(summary, trend);
    expect(tiles.map((t) => t.id)).toEqual(["all", "Disalab", "Disapoc", "Disalink"]);
    expect(tiles.map((t) => t.title)).toEqual(["Todos os sites", "Disalab", "DisaPoC", "DisaLink"]);
    expect(tiles[0]).toMatchObject({
      value: "12%",
      subtitle: "Tempo offline nos últimos 12 meses · 383/422 offline agora",
      color: "#00B000",
      labels: ["Dez 2025", "Jan 2026"],
      data: [90, 85],
    });
    expect(tiles[2]).toMatchObject({ value: "15%", color: "#F8A200", data: [80, 81] });
  });

  it("toTiles works without trend", () => {
    for (const tile of toTiles(summary, null)) expect(tile).toMatchObject({ labels: [], data: [] });
  });

  it("formats trend months in Portuguese", () => {
    expect(monthLabel("2026-03")).toBe("Mar 2026");
    expect(monthLabel("bad")).toBe("bad");
  });

  it("loads the summary and treats a failed trend as missing", async () => {
    get.mockImplementation((path: string) => (path === "/api/summary" ? Promise.resolve(summary) : Promise.reject(new Error("timeout"))));
    await expect(fetchData()).resolves.toEqual({ summary, trend: null });
  });

  it("fails when the summary fails", async () => {
    get.mockRejectedValue(new Error("DisaStatus 500"));
    await expect(fetchData()).rejects.toThrow("DisaStatus 500");
  });
});
