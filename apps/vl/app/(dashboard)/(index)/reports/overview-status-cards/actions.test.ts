import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchOverview, rateFloor, summarize, tileDetail } from "./actions";
import { DOCS } from "./docs";

const range = { start: "2025-10-13", end: "2026-10-13" };

describe("overview status cards", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });

  it("calls the summary endpoints and the rejected one with the same window", async () => {
    await fetchOverview(range, "t");
    expect(vlGet.mock.calls.map((c) => c[0])).toEqual([
      "/summary/number_of_samples_by_month/",
      "/summary/viral_suppression_by_month/",
      "/summary/tat_by_month/",
      "/laboratories/rejected_samples_by_month/",
    ]);
    expect(vlGet.mock.calls.every((c) => c[1].interval_dates === "2025-10-13,2026-10-13")).toBe(true);
    expect(vlGet.mock.calls[3][1]).toEqual({ interval_dates: "2025-10-13,2026-10-13" });
  });

  it("reproduces the legacy maths (sum, mean of rounded %, mean of TAT sums)", () => {
    const s = summarize({
      samples: [
        { year: 2026, month: 1, month_name: "January", total: 100 },
        { year: 2026, month: 2, month_name: "February", total: 50 },
      ],
      suppression: [
        { year: 2026, month: 1, month_name: "January", total: 3, suppressed: 2, not_suppressed: 1 },
        { year: 2026, month: 2, month_name: "February", total: 0, suppressed: 0, not_suppressed: 0 },
      ],
      tat: [
        { year: 2026, month: 1, month_name: "January", collection_reception: 2, reception_registration: 1, registration_analysis: null, analysis_validation: 3 },
      ],
      rejected: [
        { year: 2026, month: 1, month_name: "January", total: 4 },
        { year: 2026, month: 2, month_name: "February", total: 6 },
      ],
    });
    expect(s.rejected.value).toBe(10);
    expect(s.rejected.labels).toEqual(["Jan/26", "Fev/26"]);
    expect(s.rejected.data).toEqual([4, 6]);
    expect(s.samples.value).toBe(150);
    expect(s.samples.labels).toEqual(["Jan/26", "Fev/26"]);
    expect(s.suppression.data).toEqual([67, 0]);
    expect(s.suppression.value).toBe(34); // round((67 + 0) / 2)
    expect(s.tat.value).toBe(6);
  });

  it("returns zeros for empty responses", () => {
    const s = summarize({ samples: [], suppression: [], tat: [], rejected: [] });
    expect([s.samples.value, s.suppression.value, s.tat.value, s.rejected.value]).toEqual([0, 0, 0, 0]);
  });

  it("rate bars start a step of 5 below the lowest month", () => {
    expect(rateFloor([92, 91, 89.5, 0])).toBe(80);
    expect(rateFloor([])).toBeUndefined();
  });

  describe("detail drawer", () => {
    // Window 2025-10-28 → 2026-10-28, today in Oct/26: Oct/25 and Oct/26 are partial.
    const today = new Date(2026, 9, 28);
    const start = "2025-10-28";
    const fmt = { samples: String, suppression: (v: number) => `${v}%`, tat: (v: number) => `${v} dias`, rejected: String };
    const m = (month: number, year = 2026) => ({ year, month, month_name: "x" });
    const overview = {
      samples: [{ ...m(10, 2025), total: 5 }, { ...m(9), total: 100 }, { ...m(10), total: 30 }],
      suppression: [
        { ...m(10, 2025), total: 4, suppressed: 4, not_suppressed: 0 },
        { ...m(8), total: 10, suppressed: 8, not_suppressed: 2 },
        { ...m(9), total: 20, suppressed: 19, not_suppressed: 1 },
        { ...m(10), total: 2, suppressed: 1, not_suppressed: 1 },
      ],
      tat: [{ ...m(8), collection_reception: 3, reception_registration: 1, registration_analysis: 2, analysis_validation: 1 }, { ...m(9), collection_reception: 2, reception_registration: 1, registration_analysis: 1, analysis_validation: 1 }],
      rejected: [{ ...m(10, 2025), total: 1 }, { ...m(9), total: 8 }, { ...m(10), total: 3 }],
    };

    it("samples: total, then the complete months only (Set/26)", () => {
      const s = summarize(overview, today);
      const d = tileDetail("samples", overview, s.samples, fmt.samples, start, today);
      expect(d.figures.map((f) => [f.label, f.value, f.note])).toEqual([
        ["Total do período", "135", undefined],
        ["Média mensal", "100", "1 mês completo"],
        ["Mês mais alto", "100", "Set/26"],
        ["Mês mais baixo", "100", "Set/26"],
      ]);
      expect(d.sheet).toEqual({ header: ["Mês", "Número de amostras"], rows: [["Out/25", 5], ["Set/26", 100], ["Out/26", 30]] });
    });

    it("suppression: best and worst complete month, change in p.p., and the counts in the sheet", () => {
      const s = summarize(overview, today);
      const d = tileDetail("suppression", overview, s.suppression, fmt.suppression, start, today);
      expect(d.figures.map((f) => [f.label, f.value, f.note])).toEqual([
        ["Taxa do período", `${s.suppression.value}%`, "média das taxas mensais"],
        ["Melhor mês", "95%", "Set/26"],
        ["Pior mês", "80%", "Ago/26"],
        ["Variação", "+15.0 p.p.", "vs mês anterior"],
      ]);
      expect(d.sheet.header).toEqual(["Mês", "Supressão viral (%)", "Amostras com resultado", "Suprimidas", "Não suprimidas"]);
      expect(d.sheet.rows[1]).toEqual(["Ago/26", 80, 10, 8, 2]);
    });

    it("tat: fastest and slowest complete month, in days", () => {
      const s = summarize(overview, today);
      const d = tileDetail("tat", overview, s.tat, fmt.tat, start, today);
      expect(d.figures.map((f) => [f.label, f.value, f.note])).toEqual([
        ["Média do período", "6 dias", "média dos meses"],
        ["Mês mais rápido", "5 dias", "Set/26"],
        ["Mês mais lento", "7 dias", "Ago/26"],
      ]);
      expect(d.sheet.header).toEqual(["Mês", "Tempo de resposta (dias)"]);
    });

    it("rejected: count figures, the Excel header and the docs", () => {
      const s = summarize(overview, today);
      const d = tileDetail("rejected", overview, s.rejected, fmt.rejected, start, today);
      expect(d.figures.map((f) => f.label)).toEqual(["Total do período", "Média mensal", "Mês mais alto", "Mês mais baixo"]);
      expect(d.figures[0].value).toBe("12");
      expect(d.sheet).toEqual({ header: ["Mês", "Amostras rejeitadas"], rows: [["Out/25", 1], ["Set/26", 8], ["Out/26", 3]] });
      expect(d.docs.slice(0, 3)).toEqual(DOCS.rejected);
      expect(d.docs[3]).toContain("mês em curso");
    });

    it("docs: three sentences per tile, then the kit's note on incomplete months", () => {
      for (const key of ["samples", "suppression", "tat", "rejected"] as const) {
        expect(DOCS[key]).toHaveLength(3);
        const d = tileDetail(key, overview, summarize(overview, today)[key], fmt[key], start, today);
        expect(d.docs.slice(0, 3)).toEqual(DOCS[key]);
        expect(d.docs[3]).toContain("mês em curso");
      }
    });
  });
});
