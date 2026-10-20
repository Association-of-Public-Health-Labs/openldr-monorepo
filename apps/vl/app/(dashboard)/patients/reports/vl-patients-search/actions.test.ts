import { describe, expect, it } from "vitest";
import { buildSearch, EMPTY_FILTERS, pageSummary } from "./actions";

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

describe("pageSummary", () => {
  it("describes the page in Portuguese and never says 'página 1 de 0'", () => {
    expect(pageSummary(null)).toBe("");
    expect(pageSummary({ status: "success", page: 1, per_page: 50, total_count: 0, total_pages: 0, data: [] })).toBe(
      "0 pacientes · página 1 de 1",
    );
    expect(pageSummary({ status: "success", page: 2, per_page: 50, total_count: 120, total_pages: 3, data: [] })).toBe(
      "120 pacientes · página 2 de 3",
    );
  });
});
