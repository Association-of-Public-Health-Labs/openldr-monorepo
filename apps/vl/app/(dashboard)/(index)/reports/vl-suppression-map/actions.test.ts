import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/vl/api", () => ({ vlGet: vi.fn() }));

import { rowFor, toExcel, toMapProvinces } from "./actions";

const rows = [
  { province: "Gaza", total: 10, suppressed: 9, not_suppressed: 1, routine: 7, treatment_failure: 2, reason_not_specified: 1 },
  { province: "Zambézia", total: 0, suppressed: 0, not_suppressed: 0, routine: 0, treatment_failure: 0, reason_not_specified: 0 },
  { province: null, total: 5, suppressed: 5, not_suppressed: 0, routine: 5, treatment_failure: 0, reason_not_specified: 0 },
];

describe("vl-suppression-map", () => {
  it("maps provinces to keys with the suppression ratio, skipping null names and zero totals safely", () => {
    expect(toMapProvinces(rows)).toEqual({
      gz: { highlighted: true, highlightedColor: "#00b000", ratio: 0.9 },
      zb: { highlighted: true, highlightedColor: "#00b000", ratio: 0 },
    });
  });
  it("finds the row for a clicked map province by normalised name", () => {
    expect(rowFor(rows, "Zambezia")?.total).toBe(0);
    expect(rowFor(rows, "Tete")).toBeUndefined();
  });
  it("exports the legacy table with one column per province", () => {
    const sheet = toExcel(rows);
    expect(sheet.header).toEqual(["Motivo de Teste", "Gaza", "Zambézia", "Sem província"]);
    expect(sheet.rows.map((r) => r[0])).toEqual([
      "Rotina", "Falência Terapêutica", "Motivo não especificado", "Supressão Viral", "Taxa de Supressão (%)", "Amostras Testadas",
    ]);
    expect(sheet.rows[4]).toEqual(["Taxa de Supressão (%)", 90, 0, 100]);
  });
});
