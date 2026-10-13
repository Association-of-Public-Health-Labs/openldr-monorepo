import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const row = (lab: string, week: string, tat: number | null) => ({
  lab_code: lab.slice(0, 3).toUpperCase(), lab_name: lab, week, start: "2026-10-04", end: "2026-10-10",
  backlogs: 5, tests: 90, registrations: 100, rejections: 2, capacity: 120, tat,
});

describe("vl-weekly-report-by-lab", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches weekly_report with window and lab codes", async () => {
    await fetchData({ start: "2026-10-04", end: "2026-10-10" }, ["PJC"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/weekly_report/", { interval_dates: "2026-10-04,2026-10-10", lab_code: ["PJC"] }, "t");
  });
  it("labels by lab for one week and adds the week when several weeks are shown", () => {
    expect(toChart([row("Chimoio", "40", 3), row("INS", "40", 4)]).labels).toEqual(["Chimoio", "INS"]);
    expect(toChart([row("Chimoio", "40", 3), row("Chimoio", "41", 4)]).labels).toEqual(["Chimoio · 40", "Chimoio · 41"]);
  });
  it("draws 4 columns on the left axis and TRL as a right-axis line", () => {
    const c = toChart([row("Chimoio", "40", null)]);
    expect(c.series.map((s) => [s.name, s.type ?? "column", s.yAxis ?? 0, s.data[0]])).toEqual([
      ["Registadas", "column", 0, 100],
      ["Testadas", "column", 0, 90],
      ["Não processadas", "column", 0, 5],
      ["Capacidade", "column", 0, 120],
      ["TRL", "line", 1, 0],
    ]);
  });
  it("exports the legacy rows, including rejections", () => {
    const sheet = toExcel([row("Chimoio", "40", 3)]);
    expect(sheet.rows.map((r) => r[0])).toEqual([
      "Amostras Registadas", "Amostras Testadas", "Amostras não processadas", "Amostras Rejeitadas",
      "Capacidade Laboratorial (85%)", "Tempo de Resposta",
    ]);
    expect(sheet.rows[3]).toEqual(["Amostras Rejeitadas", 2]);
  });
});
