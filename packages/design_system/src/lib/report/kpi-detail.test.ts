import { describe, expect, it } from "vitest";
import { completeIndices, kpiDocs, kpiFigures, kpiSheet, type KpiDetailInput } from "./kpi-detail";

// Window 2025-10-28 → 2026-10-28: Oct/25 and Oct/26 are partial, Nov/25..Sep/26 complete.
const TODAY = new Date(2026, 9, 28);
const START = "2025-10-28";
const months = Array.from({ length: 13 }, (_, i) => ({ year: i < 3 ? 2025 : 2026, month: i < 3 ? 10 + i : i - 2 }));
const fmt = (v: number) => String(v);

const input = (over: Partial<KpiDetailInput>): KpiDetailInput => ({
  kind: "count",
  months,
  data: months.map(() => 10),
  value: 130,
  trend: null,
  format: fmt,
  start: START,
  ...over,
});

describe("completeIndices", () => {
  it("drops the current month and a first month the window starts mid-way", () => {
    expect(completeIndices(months, TODAY, START)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it("keeps the first month when the window starts on the 1st, or with no start", () => {
    expect(completeIndices(months, TODAY, "2025-10-01")[0]).toBe(0);
    expect(completeIndices(months, TODAY)[0]).toBe(0);
  });
  it("is empty when nothing is complete", () => {
    expect(completeIndices([], TODAY, START)).toEqual([]);
    expect(completeIndices([{ year: 2026, month: 10 }], TODAY, START)).toEqual([]);
  });
});

describe("kpiFigures", () => {
  // Partial months hold the extremes (1 and 999): they must not reach the high, low or mean.
  const data = [1, 50, 40, 60, 30, 70, 20, 80, 45, 55, 65, 35, 999];

  it("counts: total of the period (the tile's value), monthly mean, highest and lowest complete month", () => {
    const figures = kpiFigures(input({ data, value: 1550 }), TODAY);
    expect(figures).toEqual([
      { label: "Total do período", value: "1550" },
      { label: "Média mensal", value: "50", note: "11 meses completos" },
      { label: "Mês mais alto", value: "80", note: "Mai/26" },
      { label: "Mês mais baixo", value: "20", note: "Abr/26" },
    ]);
  });

  it("counts with a share: adds the % of the base over the whole period, as the tile's subtitle", () => {
    const figures = kpiFigures(
      input({ data: months.map(() => 3), value: 39, share: { label: "% das registadas", base: months.map(() => 4) } }),
      TODAY,
    );
    expect(figures).toHaveLength(5);
    expect(figures[4]).toEqual({ label: "% das registadas", value: "75%" });
  });

  it("rate: the tile's rate, best and worst complete month, change in p.p. vs the previous month", () => {
    const figures = kpiFigures(
      input({ kind: "rate", data, value: 51, trend: { previous: 64.6, last: 35.2, index: 11 }, format: (v) => `${v}%` }),
      TODAY,
    );
    expect(figures).toEqual([
      { label: "Taxa do período", value: "51%", note: "média das taxas mensais" },
      { label: "Melhor mês", value: "80%", note: "Mai/26" },
      { label: "Pior mês", value: "20%", note: "Abr/26" },
      { label: "Variação", value: "−29.4 p.p.", note: "vs mês anterior" },
    ]);
  });

  it("days: the tile's average, fastest (lowest) and slowest (highest) complete month", () => {
    const figures = kpiFigures(input({ kind: "days", data, value: 52, format: (v) => `${v} dias` }), TODAY);
    expect(figures).toEqual([
      { label: "Média do período", value: "52 dias", note: "média dos meses" },
      { label: "Mês mais rápido", value: "20 dias", note: "Abr/26" },
      { label: "Mês mais lento", value: "80 dias", note: "Mai/26" },
    ]);
  });

  it("ties go to the earliest month", () => {
    const figures = kpiFigures(input({ data: months.map(() => 7) }), TODAY);
    expect(figures[2].note).toBe("Nov/25");
    expect(figures[3].note).toBe("Nov/25");
  });

  it("shows a dash where there is no complete month or no trend", () => {
    const one = [{ year: 2026, month: 10 }];
    expect(kpiFigures(input({ months: one, data: [5], value: 5 }), TODAY)).toEqual([
      { label: "Total do período", value: "5" },
      { label: "Média mensal", value: "—", note: "0 meses completos" },
      { label: "Mês mais alto", value: "—" },
      { label: "Mês mais baixo", value: "—" },
    ]);
    expect(kpiFigures(input({ kind: "rate", months: one, data: [90], value: 90 }), TODAY)[3]).toEqual({
      label: "Variação",
      value: "—",
      note: "vs mês anterior",
    });
  });

  it("one complete month reads singular", () => {
    const two = [
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
    ];
    expect(kpiFigures(input({ months: two, data: [5, 1], value: 6, start: "2026-09-01" }), TODAY)[1].note).toBe("1 mês completo");
  });
});

describe("kpiSheet", () => {
  it("one row per month: Mês, the value, then any extra columns", () => {
    expect(kpiSheet("Amostras", ["Jan/26", "Fev/26"], [10, 20], [{ header: "% das registadas", values: [50, 40] }])).toEqual({
      header: ["Mês", "Amostras", "% das registadas"],
      rows: [
        ["Jan/26", 10, 50],
        ["Fev/26", 20, 40],
      ],
    });
  });
  it("missing extra values export as empty cells", () => {
    expect(kpiSheet("X", ["Jan/26", "Fev/26"], [1, 2], [{ header: "Y", values: [3] }]).rows[1]).toEqual(["Fev/26", 2, null]);
  });
});

describe("kpiDocs", () => {
  it("adds the incomplete-month note in each kind's wording", () => {
    const tile = ["Conta as amostras.", "Usa a data de análise."];
    expect(kpiDocs("count", tile)).toEqual([...tile, expect.stringContaining("mês mais alto e mais baixo")]);
    expect(kpiDocs("rate", tile)[2]).toContain("melhor e pior mês");
    expect(kpiDocs("days", tile)[2]).toContain("mês mais rápido e mais lento");
    expect(kpiDocs("count", tile)[2]).toContain("mês em curso");
  });
});
