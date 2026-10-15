import {
  CABO_DELGADO_DISTRICT_CODES, GAZA_DISTRICT_CODES, INHAMBANE_DISTRICT_CODES, MANICA_DISTRICT_CODES,
  MAPUTO_CIDADE_DISTRICT_CODES, MAPUTO_PROVINCIA_DISTRICT_CODES, NAMPULA_DISTRICT_CODES, NIASSA_DISTRICT_CODES,
  SOFALA_DISTRICT_CODES, TETE_DISTRICT_CODES, ZAMBEZIA_DISTRICT_CODES,
} from "@repo/design_system/app/atoms/maps/Provinces";
import { vlGetList } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { provinceKey, type ProvinceKey } from "@/lib/vl/geo";
import { NO_DATA, suppressionBand, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };

/** Province names as the API and the national map use them, with their district code tables. */
export const DISTRICT_CODES: Record<string, Readonly<Record<string, string>>> = {
  Niassa: NIASSA_DISTRICT_CODES,
  "Cabo Delgado": CABO_DELGADO_DISTRICT_CODES,
  Nampula: NAMPULA_DISTRICT_CODES,
  Zambezia: ZAMBEZIA_DISTRICT_CODES,
  Tete: TETE_DISTRICT_CODES,
  Manica: MANICA_DISTRICT_CODES,
  Sofala: SOFALA_DISTRICT_CODES,
  Inhambane: INHAMBANE_DISTRICT_CODES,
  Gaza: GAZA_DISTRICT_CODES,
  "Maputo Provincia": MAPUTO_PROVINCIA_DISTRICT_CODES,
  "Maputo Cidade": MAPUTO_CIDADE_DISTRICT_CODES,
};
export const PROVINCE_NAMES = Object.keys(DISTRICT_CODES);

const norm = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

// `location` is the neutral name the API adds; older API versions only send `province`.
const labelOf = (row: SuppressionByProvince) => row.location ?? row.province;

export const fetchProvinces = (range: DateRange, token: string | null) =>
  vlGetList<SuppressionByProvince>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

/**
 * An API without district mode ignores `disaggregation` and returns the province itself, with no
 * `location` field. Those rows are dropped: Tete, Inhambane and Manica each have a district of
 * the same name, which would otherwise take the province's figures.
 */
export const fetchDistricts = async (range: DateRange, province: string, token: string | null) => {
  const rows = await vlGetList<SuppressionByProvince>(
    ENDPOINT,
    { interval_dates: intervalParam(range), facility_type: "province", disaggregation: "true", province: [province] },
    token,
  );
  return rows.filter((row) => row.location !== undefined);
};

/** Rows are tagged with their level, so the card never draws one level's rows on the other's map. */
export type MapData = { province: string | null; rows: SuppressionByProvince[] };

export const fetchData = async (range: DateRange, province: string | null, token: string | null): Promise<MapData> => ({
  province,
  rows: province ? await fetchDistricts(range, province, token) : await fetchProvinces(range, token),
});

export const rowFor = (rows: SuppressionByProvince[], name: string) =>
  rows.find((row) => labelOf(row) && norm(labelOf(row)) === norm(name));

export function toProvinceColors(rows: SuppressionByProvince[]) {
  const provinces: Partial<Record<ProvinceKey, MapProvince>> = {};
  const fillColors: Partial<Record<ProvinceKey, string>> = {};
  for (const name of PROVINCE_NAMES) {
    const key = provinceKey(name);
    if (!key) continue;
    const color = suppressionBand(suppressionRate(rowFor(rows, name))).color;
    // Not "highlighted": that class turns the labels white, unreadable on the light band colours.
    provinces[key] = { highlighted: false, highlightedColor: color, ratio: 1 };
    fillColors[key] = color;
  }
  return { provinces, fillColors };
}

/** Every district of the province gets a colour; districts without a row are "Sem dados". */
export function toDistrictColors(province: string, rows: SuppressionByProvince[]) {
  const codes = DISTRICT_CODES[province] ?? {};
  const districtRatios: Record<string, number> = {};
  const customColors: Record<string, string> = {};
  for (const [code, district] of Object.entries(codes)) {
    const row = rowFor(rows, district);
    districtRatios[district] = 1;
    customColors[code] = row ? suppressionBand(suppressionRate(row)).color : NO_DATA.color;
  }
  return { districtRatios, customColors };
}

/** Same sheet as before the drill-down; the columns are the provinces or the open province's districts. */
export function toExcel(rows: SuppressionByProvince[]): ExcelSheet {
  const kept = rows.filter((r) => labelOf(r));
  const rate = (r: SuppressionByProvince) => {
    const value = suppressionRate(r);
    return value === null ? "" : Number(value.toFixed(1));
  };
  return {
    header: ["Motivo de Teste", ...kept.map((r) => labelOf(r) as string)],
    rows: [
      ["Rotina", ...kept.map((r) => r.routine)],
      ["Falência Terapêutica", ...kept.map((r) => r.treatment_failure)],
      ["Motivo não especificado", ...kept.map((r) => r.reason_not_specified)],
      ["Supressão Viral", ...kept.map((r) => r.suppressed)],
      ["Taxa de Supressão (%)", ...kept.map(rate)],
      ["Amostras Testadas", ...kept.map((r) => r.total)],
    ],
  };
}
