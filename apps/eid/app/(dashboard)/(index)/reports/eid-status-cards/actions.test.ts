import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toTiles } from "./actions";

const month = (m: number, registered: number, tested: number, rejected: number) => ({
  year: 2026,
  month: m,
  month_name: "x",
  registered,
  tested,
  rejected,
  pending: 0,
});

describe("eid-status-cards", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("fetches summary/indicators with no lab_type", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/indicators/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });

  it("sums the months into the 4 tiles in order, with whole-number percents", () => {
    const tiles = toTiles([month(1, 100, 90, 5), month(2, 100, 60, 5)]);
    expect(tiles.map((t) => t.title)).toEqual(["Total de Amostras", "Amostras Registadas", "Amostras Testadas", "Amostras Rejeitadas"]);
    expect(tiles.map((t) => t.value)).toEqual([200, 200, 150, 10]);
    expect(tiles.map((t) => t.percent)).toEqual(["100%", "100%", "75%", "5%"]);
    expect(tiles[2].data).toEqual([90, 60]);
    expect(tiles[2].labels).toEqual(["Jan/26", "Fev/26"]);
  });

  it("test_zero_registered_shows_zero_percent", () => {
    const tiles = toTiles([month(1, 0, 0, 0)]);
    expect(tiles.map((t) => t.percent)).toEqual(["0%", "0%", "0%", "0%"]);
    expect(toTiles([]).map((t) => t.percent)).toEqual(["0%", "0%", "0%", "0%"]);
  });

  it("trend compares the last two complete months", () => {
    const tiles = toTiles([month(1, 10, 5, 1), month(2, 20, 8, 1)], new Date(2026, 5, 1));
    expect(tiles[0].trend).toEqual({ previous: 10, last: 20, index: 1 });
  });
});
