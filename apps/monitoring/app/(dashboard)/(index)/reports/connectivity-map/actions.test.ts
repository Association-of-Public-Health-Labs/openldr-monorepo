import { afterEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/monitoring/api", () => ({ monitoringGet: (...a: unknown[]) => get(...a) }));
// The real barrel loads the MUI maps (they touch `window`); only the code tables matter here.
vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  MAPUTO_CIDADE_DISTRICT_CODES: { MZ1100I1: "KaMpfumu", MZ1100I2: "Nlhamankulu" },
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai" },
  NIASSA_DISTRICT_CODES: {}, CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {},
}));

import { districtRowFor, fetchData, provinceRowFor, toDistrictColors, toExcel, toProvinceColors } from "./actions";
import { MIN_RATIO, NO_DATA_COLOR } from "./constants";

const row = (name: string, uptimePct: number, hostCount = 3) => ({ name, uptimePct, hostCount });

describe("connectivity-map actions", () => {
  afterEach(() => get.mockReset());

  it("shades a province by its uptime and greys a province without sites", () => {
    const { provinces, fillColors } = toProvinceColors([row("Maputo Cidade", 80), row("Gaza", 0)]);
    expect(provinces.mc).toEqual({ highlighted: true, highlightedColor: "#00B000", ratio: 0.8 });
    expect(provinces.gz?.ratio).toBe(MIN_RATIO);
    expect(provinces.tt).toEqual({ highlighted: false, highlightedColor: NO_DATA_COLOR, ratio: 1 });
    expect(fillColors.tt).toBe(NO_DATA_COLOR);
  });

  it("keys district colours by map code, matching DisaStatus spellings", () => {
    const { districtRatios, customColors } = toDistrictColors("Maputo Cidade", [row("KaMpfumu", 50)]);
    expect(customColors).toEqual({ MZ1100I1: "#00B000", MZ1100I2: NO_DATA_COLOR });
    expect(districtRatios).toEqual({ KaMpfumu: 0.5, Nlhamankulu: 1 });
  });

  it("finds rows by the map's names", () => {
    expect(provinceRowFor([row("Maputo Cidade", 80)], "Maputo Cidade")?.uptimePct).toBe(80);
    expect(districtRowFor("Gaza", [row("Xai Xai", 70)], "Xai-Xai")?.uptimePct).toBe(70);
    expect(districtRowFor("Gaza", [row("Xai Xai", 70)], "Chokwe")).toBeUndefined();
  });

  it("exports the visible level", () => {
    expect(toExcel([row("Gaza", 70, 5)], "province")).toEqual({ header: ["Província", "Sites", "Conectividade (%)"], rows: [["Gaza", 5, 70]] });
    expect(toExcel([row("Xai-Xai", 70, 5)], "district").header[0]).toBe("Distrito");
  });

  it("fetches provinces nationally and districts for a province, tagged with the level", async () => {
    get.mockResolvedValue([row("Gaza", 70)]);
    await expect(fetchData(null)).resolves.toEqual({ province: null, rows: [row("Gaza", 70)] });
    expect(get).toHaveBeenLastCalledWith("/api/provinces");
    await expect(fetchData("Gaza")).resolves.toEqual({ province: "Gaza", rows: [row("Gaza", 70)] });
    expect(get).toHaveBeenLastCalledWith("/api/districts", { province: "Gaza" });
  });
});
