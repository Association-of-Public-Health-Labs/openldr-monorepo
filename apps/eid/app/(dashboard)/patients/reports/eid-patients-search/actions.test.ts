import { describe, expect, it } from "vitest";
import { initialValues } from "@repo/design_system/lib/report/patients-search";
import { SEARCH_MODES } from "./actions";

const range = { start: "2025-10-13", end: "2026-10-13" };
const interval = "2025-10-13,2026-10-13";
const base = initialValues(SEARCH_MODES);
const build = (id: string, values: Record<string, string> = {}) =>
  SEARCH_MODES.find((m) => m.id === id)!.build({ ...base, ...values }, range);

describe("EID search modes", () => {
  it("has the three modes in order", () => {
    expect(SEARCH_MODES.map((m) => m.label)).toEqual(["Por Nome", "Por US", "Por Resultado"]);
  });

  it("test_name_mode_requires_name", () => {
    expect(build("name")).toEqual({ error: "Indique o nome." });
    expect(build("name", { name: "   " })).toEqual({ error: "Indique o nome." });
  });

  it("name mode sends by_name with interval_dates and the trimmed name", () => {
    expect(build("name", { name: "  Ana Silva " })).toEqual({ endpoint: "by_name", params: { interval_dates: interval, name: "Ana Silva" } });
  });

  it("US mode: Convencional sends lab_type, Todos sends none", () => {
    const conv = build("facility", { facility: "CS Chokwe", lab_type: "conventional" });
    expect(conv).toEqual({ endpoint: "by_facility", params: { interval_dates: interval, health_facility: "CS Chokwe", lab_type: "conventional" } });
    const all = build("facility", { facility: "CS Chokwe" }) as { params: Record<string, unknown> };
    expect(all.params).not.toHaveProperty("lab_type");
  });

  it("US mode needs a facility, province and district are optional lists", () => {
    expect(build("facility")).toEqual({ error: "Indique o nome da unidade sanitária." });
    expect(build("facility", { facility: "X", province: "Gaza", district: "Chokwe", lab_type: "poc" })).toMatchObject({
      params: { province: ["Gaza"], district: ["Chokwe"], lab_type: "poc" },
    });
  });

  it("result mode maps Pendente to result_type pending, and needs a choice", () => {
    expect(build("result")).toEqual({ error: "Escolha o tipo de resultado." });
    expect(build("result", { result: "pending" })).toEqual({ endpoint: "by_result_type", params: { interval_dates: interval, result_type: ["pending"] } });
  });

  it("Análise sends date_basis analysis, Registo sends none, in every mode", () => {
    const filled = { name: "Ana", facility: "X", result: "positive" };
    for (const id of ["name", "facility", "result"]) {
      const a = build(id, { ...filled, date_basis: "analysis" }) as { params: Record<string, unknown> };
      expect(a.params.date_basis).toBe("analysis");
      const r = build(id, filled) as { params: Record<string, unknown> };
      expect(r.params).not.toHaveProperty("date_basis");
    }
  });

  it("shares one Data de referência key across modes", () => {
    const keys = SEARCH_MODES.map((m) => m.fields.filter((f) => f.label === "Data de referência").map((f) => f.key));
    expect(keys.every((k) => k.length === 1 && k[0] === keys[0]![0])).toBe(true);
  });
});
