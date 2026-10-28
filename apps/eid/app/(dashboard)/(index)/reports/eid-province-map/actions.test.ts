import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));
// The real barrel loads the MUI maps (they touch `window`); only the code tables matter here.
vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai", MZ0900C6: "Chokwe" },
  NIASSA_DISTRICT_CODES: {}, CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {}, MAPUTO_CIDADE_DISTRICT_CODES: {},
}));

import {
  fetchData, rowFor, rowsForView, sumFacilities, toDistrictColors, toExcel, toFacilityExcel, toProvinceColors, type MapData,
} from "./actions";

const range = { start: "2025-10-15", end: "2026-10-15" };
const prov = (province: string | null, positivity: number) => ({
  province, registered: 100, tested: 50, rejected: 2, pending: 3, conventional: 40, poc: 10, positive: 1, positivity,
});
const key = (requesting_facility: string | null, registered: number, tested: number, positive: number, rejected = 0, pending = 0) => ({
  requesting_facility, registered, tested, rejected, pending, positive,
  positivity: tested ? Math.round((positive / tested) * 1000) / 10 : 0,
});

describe("eid-province-map actions", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("national: indicators_by_province with interval_dates only", async () => {
    eidGet.mockResolvedValueOnce([prov("Gaza", 2)]);
    const data = await fetchData(range, null, null, "conventional", "t");
    expect(eidGet).toHaveBeenLastCalledWith("/summary/indicators_by_province/", { interval_dates: "2025-10-15,2026-10-15" }, "t");
    expect(data).toEqual({ province: null, district: null, rows: [prov("Gaza", 2)], facilities: [] });
  });

  it("province: the province's districts from key_indicators, with the lab type", async () => {
    const data = await fetchData(range, "Gaza", null, "conventional", "t");
    expect(eidGet).toHaveBeenLastCalledWith(
      "/facilities/key_indicators/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "province", province: ["Gaza"], disaggregation: "true", lab_type: "conventional" },
      "t",
    );
    expect(data).toEqual({ province: "Gaza", district: null, rows: [], facilities: [] });
  });

  it("district: its facilities under the API's spelling of the district", async () => {
    eidGet.mockResolvedValueOnce([key("Chókwè", 10, 8, 1)]).mockResolvedValueOnce([key("CS Barragem", 4, 4, 0)]);
    const data = await fetchData(range, "Gaza", "Chokwe", "poc", "t");
    expect(eidGet).toHaveBeenLastCalledWith(
      "/facilities/key_indicators/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "district", district: ["Chókwè"], disaggregation: "true", lab_type: "poc" },
      "t",
    );
    expect(data).toMatchObject({ province: "Gaza", district: "Chokwe", facilities: [{ requesting_facility: "CS Barragem" }] });
  });

  it("shades provinces by positivity ÷ the highest shown; a province with no row is grey and not highlighted", () => {
    const { provinces, fillColors } = toProvinceColors([prov("Gaza", 2.0), prov("Tete", 4.0), prov(null, 9)]);
    expect(provinces.gz).toEqual({ highlighted: true, highlightedColor: "#fda92d", ratio: 0.5 });
    expect(provinces.tt?.ratio).toBe(1);
    expect(fillColors.gz).toBe("#fda92d");
    expect(provinces.ns?.highlighted).toBe(false);
    expect(fillColors.ns).toBe("#C4CDD5");
    expect(Object.keys(fillColors)).toHaveLength(11);
  });

  it("test_accented_province_matches_map_key", () => {
    const { provinces, fillColors } = toProvinceColors([prov("Zambézia", 3), prov("Maputo Província", 1.5)]);
    expect(provinces.zb).toEqual({ highlighted: true, highlightedColor: "#fda92d", ratio: 1 });
    expect(fillColors.zb).toBe("#fda92d");
    expect(provinces.mp?.ratio).toBe(0.5);
  });

  it("test_rows_for_other_province_are_ignored", () => {
    const data: MapData = { province: "Gaza", district: null, rows: [key("Chókwè", 1, 1, 0)], facilities: [] };
    expect(rowsForView(data, "Tete")).toEqual([]);
    expect(rowsForView(data, null)).toEqual([]);
    expect(rowsForView(null, "Gaza")).toEqual([]);
    expect(rowsForView(data, "Gaza")).toEqual(data.rows);
  });

  it("shades a province's districts by positivity, matching names loosely; districts without a row are grey", () => {
    const { districtRatios, customColors } = toDistrictColors("Gaza", [key("chókwè ", 10, 10, 2), key(null, 5, 5, 5)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#fda92d" });
    expect(districtRatios).toEqual({ "Xai-Xai": 1, Chokwe: 1 });
  });

  it("finds rows by name ignoring case and accents, on either level", () => {
    expect(rowFor([key("Chokwe", 1, 1, 0)], "CHÓKWÈ")?.requesting_facility).toBe("Chokwe");
    expect(rowFor([prov("Zambézia", 1)], "Zambezia")?.province).toBe("Zambézia");
  });

  it("sumFacilities sums every count and recomputes positivity (1 decimal, 0 when nothing was tested)", () => {
    expect(sumFacilities([key("A", 10, 6, 1, 2, 1), key("B", 5, 3, 1, 0, 2)])).toEqual({
      registered: 15, tested: 9, rejected: 2, pending: 3, positive: 2, positivity: 22.2,
    });
    expect(sumFacilities([key("A", 4, 0, 0)]).positivity).toBe(0);
    expect(sumFacilities([]).positivity).toBe(0);
  });

  it("facility export: one row per facility, null names as 'Sem unidade sanitária', and the district total", () => {
    const sheet = toFacilityExcel([key("CS A", 10, 6, 1, 2, 1), key(null, 5, 3, 1, 0, 2)]);
    expect(sheet.header).toEqual(["Unidade Sanitária", "Registadas", "Testadas", "Rejeitadas", "Pendentes", "Positivas", "Positividade (%)"]);
    expect(sheet.rows).toEqual([
      ["CS A", 10, 6, 2, 1, 1, 16.7],
      ["Sem unidade sanitária", 5, 3, 0, 2, 1, 33.3],
      ["Total do distrito", 15, 9, 2, 3, 2, 22.2],
    ]);
  });

  it("exports the level being viewed: provinces with Convencional and PoC, or districts", () => {
    const national = toExcel([prov("Gaza", 2), prov(null, 1)]);
    expect(national.header).toEqual(["Província", "Registadas", "Testadas", "Rejeitadas", "Pendentes", "Positivas", "Positividade (%)", "Convencional", "PoC"]);
    expect(national.rows).toEqual([["Gaza", 100, 50, 2, 3, 1, 2, 40, 10]]);
    const districts = toExcel([key("Chókwè", 10, 8, 1)]);
    expect(districts.header[0]).toBe("Distrito");
    expect(districts.rows).toEqual([["Chókwè", 10, 8, 0, 0, 1, 12.5]]);
  });
});
