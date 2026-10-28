import { describe, expect, it } from "vitest";
import { initialValues } from "@repo/design_system/lib/report/patients-search";
import { buildSearch, EMPTY_FILTERS, SEARCH_MODES, type SearchMode } from "./actions";

const range = { start: "2025-10-13", end: "2026-10-13" };

describe("buildSearch", () => {
  it("by name needs a first name or a surname, and trims them", () => {
    expect(buildSearch("name", EMPTY_FILTERS, range)).toEqual({ error: "Indique o nome ou o apelido." });
    expect(buildSearch("name", { ...EMPTY_FILTERS, surname: "  Silva " }, range)).toEqual({
      endpoint: "by_name",
      params: { interval_dates: "2025-10-13,2026-10-13", first_name: undefined, surname: "Silva" },
    });
  });

  it("by facility needs the facility; province and district are optional", () => {
    expect(buildSearch("facility", EMPTY_FILTERS, range)).toEqual({ error: "Indique o nome da unidade sanitária." });
    expect(buildSearch("facility", { ...EMPTY_FILTERS, facility: "CS Chokwe", district: "Chokwe" }, range)).toEqual({
      endpoint: "by_facility",
      params: { interval_dates: "2025-10-13,2026-10-13", health_facility: "CS Chokwe", province: undefined, district: ["Chokwe"] },
    });
  });

  it("by result and by reason need a choice", () => {
    expect(buildSearch("result", EMPTY_FILTERS, range)).toEqual({ error: "Escolha o tipo de resultado." });
    expect(buildSearch("result", { ...EMPTY_FILTERS, resultType: "not_suppressed" }, range)).toMatchObject({
      endpoint: "by_result_type",
      params: { result_type: ["not_suppressed"] },
    });
    expect(buildSearch("reason", EMPTY_FILTERS, range)).toEqual({ error: "Escolha o motivo de teste." });
    expect(buildSearch("reason", { ...EMPTY_FILTERS, testReason: "Routine" }, range)).toMatchObject({
      endpoint: "by_test_reason",
      params: { test_reason: ["Routine"] },
    });
  });
});

describe("SEARCH_MODES", () => {
  it("each mode's build maps its field values to buildSearch, filled or empty", () => {
    const filled = {
      ...initialValues(SEARCH_MODES),
      first: "Ana",
      surname: "Silva",
      facility: "CS Chokwe",
      province: "Gaza",
      district: "Chokwe",
      result: "suppressed",
      reason: "Routine",
    };
    const filters = {
      firstName: "Ana",
      surname: "Silva",
      facility: "CS Chokwe",
      province: "Gaza",
      district: "Chokwe",
      resultType: "suppressed" as const,
      testReason: "Routine" as const,
    };
    for (const mode of SEARCH_MODES) {
      const id = mode.id as SearchMode;
      expect(mode.build(filled, range)).toEqual(buildSearch(id, filters, range));
      expect(mode.build(initialValues(SEARCH_MODES), range)).toEqual(buildSearch(id, EMPTY_FILTERS, range));
    }
  });

  it("keeps the tabs, in order, and the field keys behind the p-* ids", () => {
    expect(SEARCH_MODES.map((m) => [m.id, m.label, m.fields.map((f) => f.key)])).toEqual([
      ["name", "Por Nome", ["first", "surname"]],
      ["facility", "Por US", ["facility", "province", "district"]],
      ["result", "Por Resultado", ["result"]],
      ["reason", "Por Motivo", ["reason"]],
    ]);
  });
});
