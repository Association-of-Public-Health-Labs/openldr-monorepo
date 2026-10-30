import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, tileDetail, toTiles } from "./actions";
import { DOCS } from "./docs";

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

  describe("detail drawer", () => {
    // Window 2025-10-28 → 2026-10-28, today in Oct/26: Oct/25 and Oct/26 are partial.
    const today = new Date(2026, 9, 28);
    const start = "2025-10-28";
    const rows = [
      { ...month(10, 10, 9, 1), year: 2025 },
      month(8, 100, 90, 4),
      month(9, 200, 150, 10),
      month(10, 50, 10, 0),
    ];
    const tiles = toTiles(rows, today);

    it("counts: total, monthly mean and the highest and lowest complete month", () => {
      const d = tileDetail(tiles[0], rows, String, start, today);
      expect(d.figures.map((f) => [f.label, f.value, f.note])).toEqual([
        ["Total do período", "360", undefined],
        ["Média mensal", "150", "2 meses completos"],
        ["Mês mais alto", "200", "Set/26"],
        ["Mês mais baixo", "100", "Ago/26"],
      ]);
      expect(d.sheet).toEqual({
        header: ["Mês", "Total de Amostras"],
        rows: [["Out/25", 10], ["Ago/26", 100], ["Set/26", 200], ["Out/26", 50]],
      });
    });

    it("tested and rejected add the share of registered, in the strip and the sheet", () => {
      const tested = tileDetail(tiles[2], rows, String, start, today);
      expect(tested.figures.at(-1)).toEqual({ label: "% das registadas", value: tiles[2].percent });
      expect(tested.sheet.header).toEqual(["Mês", "Amostras Testadas", "% das registadas"]);
      expect(tested.sheet.rows.map((r) => r[2])).toEqual([90, 90, 75, 20]);
      const rejected = tileDetail(tiles[3], rows, String, start, today);
      expect(rejected.figures).toHaveLength(5);
      expect(rejected.sheet.rows[2]).toEqual(["Set/26", 10, 5]);
    });

    it("total and registered have no share column", () => {
      expect(tileDetail(tiles[1], rows, String, start, today).figures).toHaveLength(4);
      expect(tileDetail(tiles[1], rows, String, start, today).sheet.header).toEqual(["Mês", "Amostras Registadas"]);
    });

    it("docs: three sentences per tile, then the kit's note on incomplete months", () => {
      for (const tile of tiles) {
        expect(DOCS[tile.id]).toHaveLength(3);
        const docs = tileDetail(tile, rows, String, start, today).docs;
        expect(docs.slice(0, 3)).toEqual(DOCS[tile.id]);
        expect(docs[3]).toContain("mês em curso");
      }
      expect(DOCS.total.join(" ")).toContain("Amostras Registadas");
    });
  });
});
