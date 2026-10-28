import { eidGetList } from "@/lib/eid/api";
import { EID_PRIMARY } from "@/lib/eid/series";
import type { IndicatorsByProvince, KeyIndicators, LabType } from "@/lib/eid/types";
import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import { DISTRICT_CODES, PROVINCE_NAMES } from "@repo/design_system/lib/report/districts";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { num } from "@repo/design_system/lib/report/format";
import { normalizeName, provinceKey, type ProvinceKey } from "@repo/design_system/lib/report/geo";
import { DRILL_ENDPOINT, ENDPOINT, LABELS, MIN_RATIO, NO_DATA_COLOR } from "./constants";

export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };
type PlaceRow = IndicatorsByProvince | KeyIndicators;

/** The row's place: `province` on the national level, `requesting_facility` below it. */
export const placeOf = (row: PlaceRow): string | null => ("province" in row ? row.province : row.requesting_facility);

// Provinces compare by map key ("Maputo Província" = "Maputo Provincia"), anything else by name.
const sameName = (a: string, b: string) => {
  const ka = provinceKey(a);
  const kb = provinceKey(b);
  return ka && kb ? ka === kb : normalizeName(a) === normalizeName(b);
};

export function rowFor<R extends PlaceRow>(rows: R[], name: string): R | undefined {
  return rows.find((row) => {
    const place = placeOf(row);
    return !!place && sameName(place, name);
  });
}

/**
 * Rows are tagged with their level, so the card never draws one level's rows on another's map.
 * National: `rows` are provinces. Province: `rows` are its districts. District: `rows` are still the
 * province's districts and `facilities` the district's health facilities.
 */
export type MapData = {
  province: string | null;
  district: string | null;
  /** The lab type the rows were fetched for: the kit keeps the previous data while a new request loads. */
  labType: LabType;
  rows: IndicatorsByProvince[] | KeyIndicators[];
  facilities: KeyIndicators[];
};

/** National level: no lab_type, so the default request hits the API cache seeds. */
export const fetchProvinces = (range: DateRange, token: string | null) =>
  eidGetList<IndicatorsByProvince>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

/** ✱1: each lab type has its own rows; `province` is read for facility_type=province. */
export const fetchDistricts = (range: DateRange, province: string, labType: LabType, token: string | null) =>
  eidGetList<KeyIndicators>(
    DRILL_ENDPOINT,
    { interval_dates: intervalParam(range), facility_type: "province", province: [province], disaggregation: "true", lab_type: labType },
    token,
  );

/** `district` is read for facility_type=district (the API ignores `province` there). */
export const fetchFacilities = (range: DateRange, district: string, labType: LabType, token: string | null) =>
  eidGetList<KeyIndicators>(
    DRILL_ENDPOINT,
    { interval_dates: intervalParam(range), facility_type: "district", district: [district], disaggregation: "true", lab_type: labType },
    token,
  );

export async function fetchData(
  range: DateRange,
  province: string | null,
  district: string | null,
  labType: LabType,
  token: string | null,
): Promise<MapData> {
  if (!province) return { province: null, district: null, labType, rows: await fetchProvinces(range, token), facilities: [] };
  const rows = await fetchDistricts(range, province, labType, token);
  if (!district) return { province, district: null, labType, rows, facilities: [] };
  // The district as the API spells it (the map's name may differ in accents or case).
  const apiName = rowFor(rows, district)?.requesting_facility ?? district;
  return { province, district, labType, rows, facilities: await fetchFacilities(range, apiName, labType, token) };
}

/** Rows of the level being viewed; another level's or lab type's rows (a slower, older response) are never drawn. */
export function rowsForView(data: MapData | null | undefined, province: string | null, labType: LabType): MapData["rows"] {
  if (!data || !province || data.province !== province || data.labType !== labType) return [];
  return data.rows;
}

/** The district's facilities, only when `data` is that district's, for that lab type. */
export function facilitiesForView(
  data: MapData | null | undefined,
  province: string | null,
  district: string | null,
  labType: LabType,
): KeyIndicators[] {
  if (!data || !district || data.province !== province || data.district !== district || data.labType !== labType) return [];
  return data.facilities;
}

/** The lab type of the data applied, for the Excel subtitle (`fallback` before any data). */
export const exportLabType = (data: MapData | null | undefined, fallback: LabType): LabType => data?.labType ?? fallback;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Positive ÷ tested in percent, 1 decimal; 0 when nothing was tested. */
export const positivityOf = (positive: number, tested: number) => (tested > 0 ? round1((positive / tested) * 100) : 0);

/** Totals of a district's facilities, for the table's last row. */
export function sumFacilities(rows: KeyIndicators[]) {
  const total = (key: "registered" | "tested" | "rejected" | "pending" | "positive") => rows.reduce((n, r) => n + num(r[key]), 0);
  const tested = total("tested");
  const positive = total("positive");
  return {
    registered: total("registered"),
    tested,
    rejected: total("rejected"),
    pending: total("pending"),
    positive,
    positivity: positivityOf(positive, tested),
  };
}

/** E2: shade = positivity ÷ the highest positivity shown (floored so 0% stays visible). */
const shadeOf = (positivity: number | null, max: number) => (max > 0 ? Math.max(MIN_RATIO, num(positivity) / max) : MIN_RATIO);
const maxPositivity = (rows: (PlaceRow | undefined)[]) => Math.max(0, ...rows.map((r) => (r ? num(r.positivity) : 0)));

export function toProvinceColors(rows: IndicatorsByProvince[]) {
  const provinces: Partial<Record<ProvinceKey, MapProvince>> = {};
  const fillColors: Partial<Record<ProvinceKey, string>> = {};
  const shown = PROVINCE_NAMES.map((name) => rowFor(rows, name));
  const max = maxPositivity(shown);
  PROVINCE_NAMES.forEach((name, i) => {
    const key = provinceKey(name);
    if (!key) return;
    const row = shown[i];
    provinces[key] = row
      ? { highlighted: true, highlightedColor: EID_PRIMARY, ratio: shadeOf(row.positivity, max) }
      : { highlighted: false, highlightedColor: NO_DATA_COLOR, ratio: 1 };
    fillColors[key] = row ? EID_PRIMARY : NO_DATA_COLOR;
  });
  return { provinces, fillColors };
}

/** Every district of the province gets a colour; districts without a row are "Sem dados". */
export function toDistrictColors(province: string, rows: KeyIndicators[]) {
  const codes = DISTRICT_CODES[province] ?? {};
  const shown = Object.values(codes).map((district) => rowFor(rows, district));
  const max = maxPositivity(shown);
  const districtRatios: Record<string, number> = {};
  const customColors: Record<string, string> = {};
  Object.entries(codes).forEach(([code, district], i) => {
    const row = shown[i];
    districtRatios[district] = row ? shadeOf(row.positivity, max) : 1;
    customColors[code] = row ? EID_PRIMARY : NO_DATA_COLOR;
  });
  return { districtRatios, customColors };
}

/** Facility rows with no name are kept, under "Sem unidade sanitária", so the total adds up. */
export const facilityName = (row: KeyIndicators) => row.requesting_facility?.trim() || LABELS.NO_FACILITY;

const COUNT_HEADER = ["Registadas", "Testadas", "Rejeitadas", "Pendentes", "Positivas", "Positividade (%)"];
const counts = (r: Omit<KeyIndicators, "requesting_facility">) => [
  num(r.registered), num(r.tested), num(r.rejected), num(r.pending), num(r.positive), num(r.positivity),
];

/** The facility table as a sheet, with the district total. */
export function toFacilityExcel(rows: KeyIndicators[]): ExcelSheet {
  return {
    header: ["Unidade Sanitária", ...COUNT_HEADER],
    rows: [...rows.map((r) => [facilityName(r), ...counts(r)]), [LABELS.FACILITY_TOTAL, ...counts(sumFacilities(rows))]],
  };
}

/** The map level being viewed: provinces (with the Convencional and PoC split) or a province's districts. */
export function toExcel(rows: MapData["rows"], national = rows.length > 0 && "province" in rows[0]): ExcelSheet {
  const kept = (rows as PlaceRow[]).filter((r) => placeOf(r)?.trim());
  if (national) {
    return {
      header: ["Província", ...COUNT_HEADER, "Convencional", "PoC"],
      rows: (kept as IndicatorsByProvince[]).map((r) => [r.province as string, ...counts(r), num(r.conventional), num(r.poc)]),
    };
  }
  return { header: ["Distrito", ...COUNT_HEADER], rows: (kept as KeyIndicators[]).map((r) => [r.requesting_facility as string, ...counts(r)]) };
}
