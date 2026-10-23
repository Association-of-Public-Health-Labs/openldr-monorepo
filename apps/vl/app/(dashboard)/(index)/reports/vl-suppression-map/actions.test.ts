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

import { fetchData, rowFor, sumFacilities, toDistrictColors, toExcel, toFacilityExcel, toProvinceColors } from "./actions";

const range = { start: "2025-10-15", end: "2026-10-15" };
const row = (label: string | null, suppressed: number, not_suppressed: number) => ({
  province: label, location: label, total: suppressed + not_suppressed, suppressed, not_suppressed,
  routine: 1, treatment_failure: 2, reason_not_specified: 0,
});

describe("vl-suppression-map actions", () => {
  beforeEach(() => { vlGet.mockReset(); vlGet.mockResolvedValue([]); });

  it("tags the rows with the level they belong to", async () => {
    vlGet.mockResolvedValueOnce([row("Tete", 9, 1)]);
    expect(await fetchData(range, null, null, "t")).toEqual({ province: null, district: null, rows: [row("Tete", 9, 1)], facilities: [] });
    vlGet.mockResolvedValueOnce([row("Tete", 9, 1)]);
    expect((await fetchData(range, "Tete", null, "t")).province).toBe("Tete");
  });

  it("drops district rows from an API without district mode (no 'location'), so 'Tete' district is not given Tete province's figures", async () => {
    const { location: _, ...provinceRow } = row("Tete", 99, 1);
    vlGet.mockResolvedValueOnce([provinceRow]);
    expect(await fetchData(range, "Tete", null, "t")).toEqual({ province: "Tete", district: null, rows: [], facilities: [] });
  });

  it("fetches provinces, then a province's districts with the drill params", async () => {
    await fetchData(range, null, null, "t");
    expect(vlGet).toHaveBeenLastCalledWith("/summary/suppression_by_province_by_month/", { interval_dates: "2025-10-15,2026-10-15" }, "t");
    await fetchData(range, "Gaza", null, "t");
    expect(vlGet).toHaveBeenLastCalledWith(
      "/summary/suppression_by_province_by_month/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "province", disaggregation: "true", province: ["Gaza"] },
      "t",
    );
  });

  it("with a district open, fetches its facilities under the API's spelling of the district", async () => {
    vlGet.mockResolvedValueOnce([row("Chókwè", 9, 1)]).mockResolvedValueOnce([{ requesting_facility: "CS Barragem", total: 10, suppressed: 8, not_suppressed: 1 }]);
    const data = await fetchData(range, "Gaza", "Chokwe", "t");
    expect(vlGet).toHaveBeenLastCalledWith(
      "/facilities/tested_samples_by_facility/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "district", disaggregation: "true", province: ["Gaza"], district: ["Chókwè"] },
      "t",
    );
    expect(data).toMatchObject({ province: "Gaza", district: "Chokwe", facilities: [{ requesting_facility: "CS Barragem" }] });
  });

  it("facility table export: one row per facility and the district total", () => {
    const rows = [
      { requesting_facility: "CS A", total: 12, suppressed: 9, not_suppressed: 1 },
      { requesting_facility: "CS B", total: 5, suppressed: 0, not_suppressed: 0 },
    ];
    expect(sumFacilities(rows)).toEqual({ total: 17, suppressed: 9, not_suppressed: 1 });
    expect(toFacilityExcel(rows)).toEqual({
      header: ["Unidade Sanitária", "Amostras Testadas", "Amostras <1000 cp/ml", "Supressão Viral (%)"],
      rows: [["CS A", 12, 9, 90], ["CS B", 5, 0, ""], ["Total do distrito", 17, 9, 90]],
    });
  });

  it("colours every province by band and greys provinces without data", () => {
    const { provinces, fillColors } = toProvinceColors([row("Gaza", 950, 50), row("Tete", 70, 30), row(null, 1, 1)]);
    expect(fillColors.gz).toBe("#00B000");
    expect(fillColors.tt).toBe("#CCEFCC");
    expect(fillColors.ns).toBe("#C4CDD5");
    expect(provinces.ns?.ratio).toBe(1);
    // "highlighted" turns the province labels white, unreadable on the light band colours.
    expect(provinces.gz?.highlighted).toBe(false);
    expect(Object.keys(fillColors)).toHaveLength(11);
  });

  it("colours every district of the province, matching names loosely", () => {
    const { districtRatios, customColors } = toDistrictColors("Gaza", [row("chókwè ", 85, 15), row(null, 5, 5)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#99DF99" });
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
