import { describe, expect, it, vi } from "vitest";

vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai", MZ0900C6: "Chokwe" },
  NIASSA_DISTRICT_CODES: {}, CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {}, MAPUTO_CIDADE_DISTRICT_CODES: {},
}));

import { districtColors, offTargetCount, provinceColors, toExcel } from "./actions";

const unit = (name: string, counts: [number, number, number, number], noDate = 0) => ({ name, counts, noDate });

describe("transport page helpers", () => {
  it("colours provinces by class and greys those without samples", () => {
    const { fillColors, provinces } = toProvinceMap();
    expect(fillColors.gz).toBe("#C1272D");
    expect(fillColors.ns).toBe("#C4CDD5");
    expect(provinces.gz?.highlighted).toBe(false);
    expect(Object.keys(fillColors)).toHaveLength(11);
  });

  it("colours a province's districts and outlines the open one, names matched loosely", () => {
    const colors = districtColors("Gaza", [unit("chókwè", [9, 1, 0, 0])], "Chokwe");
    expect(colors.customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#1B7837" });
    expect(colors.highlightedDistricts).toEqual(["Chokwe"]);
    expect(colors.highlightedColor).toBe("#1B7837");
    expect(districtColors("Gaza", [], null).highlightedDistricts).toEqual([]);
  });

  it("counts the areas off target", () => {
    expect(offTargetCount([unit("a", [0, 1, 4, 0]), unit("b", [5, 0, 0, 0]), unit("c", [0, 0, 0, 0])])).toBe(1);
  });

  it("exports one row per child and the area's total", () => {
    const sheet = toExcel(unit("Gaza", [3, 1, 0, 0], 2), [unit("Chokwe", [3, 1, 0, 0], 2)], "district");
    expect(sheet.header).toEqual(["Distrito", "Classe TAT", "% <15 dias", "Amostras", "<7 dias", "7-15 dias", "16-21 dias", ">21 dias", "Sem data de colheita"]);
    expect(sheet.rows).toEqual([
      ["Chokwe", "<7 dias", 100, 4, 3, 1, 0, 0, 2],
      ["Total (Gaza)", "<7 dias", 100, 4, 3, 1, 0, 0, 2],
    ]);
  });
});

function toProvinceMap() {
  return provinceColors([unit("Gaza", [0, 0, 1, 5])]);
}
