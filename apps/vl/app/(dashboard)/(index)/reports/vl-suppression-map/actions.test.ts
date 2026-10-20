import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));
// The real barrel loads the MUI maps (they touch `window`); only the code tables matter here.
vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai", MZ0900C6: "Chokwe" },
  NIASSA_DISTRICT_CODES: {}, CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {}, MAPUTO_CIDADE_DISTRICT_CODES: {},
}));

import { fetchData, rowFor, toDistrictColors, toExcel, toProvinceColors } from "./actions";

const range = { start: "2025-10-15", end: "2026-10-15" };
const row = (label: string | null, suppressed: number, not_suppressed: number) => ({
  province: label, location: label, total: suppressed + not_suppressed, suppressed, not_suppressed,
  routine: 1, treatment_failure: 2, reason_not_specified: 0,
});

describe("vl-suppression-map actions", () => {
  beforeEach(() => { vlGet.mockReset(); vlGet.mockResolvedValue([]); });

  it("tags the rows with the level they belong to", async () => {
    vlGet.mockResolvedValueOnce([row("Tete", 9, 1)]);
    expect(await fetchData(range, null, "t")).toEqual({ province: null, rows: [row("Tete", 9, 1)] });
    vlGet.mockResolvedValueOnce([row("Tete", 9, 1)]);
    expect((await fetchData(range, "Tete", "t")).province).toBe("Tete");
  });

  it("drops district rows from an API without district mode (no 'location'), so 'Tete' district is not given Tete province's figures", async () => {
    const { location: _, ...provinceRow } = row("Tete", 99, 1);
    vlGet.mockResolvedValueOnce([provinceRow]);
    expect(await fetchData(range, "Tete", "t")).toEqual({ province: "Tete", rows: [] });
  });

  it("fetches provinces, then a province's districts with the drill params", async () => {
    await fetchData(range, null, "t");
    expect(vlGet).toHaveBeenLastCalledWith("/summary/suppression_by_province_by_month/", { interval_dates: "2025-10-15,2026-10-15" }, "t");
    await fetchData(range, "Gaza", "t");
    expect(vlGet).toHaveBeenLastCalledWith(
      "/summary/suppression_by_province_by_month/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "province", disaggregation: "true", province: ["Gaza"] },
      "t",
    );
  });

  it("colours every province by band and greys provinces without data", () => {
    const { provinces, fillColors } = toProvinceColors([row("Gaza", 950, 50), row("Tete", 70, 30), row(null, 1, 1)]);
    expect(fillColors.gz).toBe("#00B000");
    expect(fillColors.tt).toBe("#EF5350");
    expect(fillColors.ns).toBe("#C4CDD5");
    expect(provinces.ns?.ratio).toBe(1);
    // "highlighted" turns the province labels white, unreadable on the light band colours.
    expect(provinces.gz?.highlighted).toBe(false);
    expect(Object.keys(fillColors)).toHaveLength(11);
  });

  it("colours every district of the province, matching names loosely", () => {
    const { districtRatios, customColors } = toDistrictColors("Gaza", [row("chókwè ", 85, 15), row(null, 5, 5)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#FFAB00" });
    expect(districtRatios).toEqual({ "Xai-Xai": 1, Chokwe: 1 });
  });

  it("ignores rows that are not districts of the province (production before the API release)", () => {
    const { customColors } = toDistrictColors("Gaza", [row("Gaza", 99, 1)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#C4CDD5" });
  });

  it("finds rows by name ignoring case and accents", () => {
    expect(rowFor([row("Chokwe", 1, 1)], "CHÓKWÈ")?.location).toBe("Chokwe");
  });

  it("exports the level being viewed, without the null row", () => {
    const sheet = toExcel([row("Chokwe", 85, 15), row("Bilene", 0, 0), row(null, 1, 1)]);
    expect(sheet.header).toEqual(["Motivo de Teste", "Chokwe", "Bilene"]);
    expect(sheet.rows.find((r) => r[0] === "Taxa de Supressão (%)")).toEqual(["Taxa de Supressão (%)", 85, ""]);
  });
});
