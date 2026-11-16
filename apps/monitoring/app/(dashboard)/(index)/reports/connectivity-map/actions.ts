import { DISTRICT_CODES, PROVINCE_NAMES } from "@repo/design_system/lib/report/districts";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { provinceKey, type ProvinceKey } from "@repo/design_system/lib/report/geo";
import { monitoringGet } from "@/lib/monitoring/api";
import { MONITORING_PRIMARY } from "@/lib/monitoring/colors";
import { matchDistrict } from "@/lib/monitoring/regions";
import type { RegionConnectivity } from "@/lib/monitoring/types";
import { MIN_RATIO, NO_DATA_COLOR } from "./constants";

export type Row = Pick<RegionConnectivity, "name" | "uptimePct" | "hostCount">;
export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };
/** Rows tagged with their level, so one level's rows are never drawn on another's map. */
export type MapData = { province: string | null; rows: Row[] };

/** Uptime is already a share of 100, so the shade is absolute (not relative to the best region). */
const shadeOf = (uptimePct: number) => Math.max(MIN_RATIO, Math.min(1, uptimePct / 100));

/** Province rows are keyed by the map's province names (the route normalises them). */
export const provinceRowFor = (rows: Row[], name: string) => rows.find((r) => r.name === name);

export const districtRowFor = (province: string, rows: Row[], mapName: string) =>
  rows.find((r) => matchDistrict(province, r.name, [mapName]) === mapName);

export function toProvinceColors(rows: Row[]) {
  const provinces: Partial<Record<ProvinceKey, MapProvince>> = {};
  const fillColors: Partial<Record<ProvinceKey, string>> = {};
  for (const name of PROVINCE_NAMES) {
    const key = provinceKey(name);
    if (!key) continue;
    const row = provinceRowFor(rows, name);
    provinces[key] = row
      ? { highlighted: true, highlightedColor: MONITORING_PRIMARY, ratio: shadeOf(row.uptimePct) }
      : { highlighted: false, highlightedColor: NO_DATA_COLOR, ratio: 1 };
    fillColors[key] = row ? MONITORING_PRIMARY : NO_DATA_COLOR;
  }
  return { provinces, fillColors };
}

export function toDistrictColors(province: string, rows: Row[]) {
  const districtRatios: Record<string, number> = {};
  const customColors: Record<string, string> = {};
  for (const [code, district] of Object.entries(DISTRICT_CODES[province] ?? {})) {
    const row = districtRowFor(province, rows, district);
    districtRatios[district] = row ? shadeOf(row.uptimePct) : 1;
    customColors[code] = row ? MONITORING_PRIMARY : NO_DATA_COLOR;
  }
  return { districtRatios, customColors };
}

export function toExcel(rows: Row[], level: "province" | "district"): ExcelSheet {
  return {
    header: [level === "province" ? "Província" : "Distrito", "Sites", "Conectividade (%)"],
    rows: rows.map((r) => [r.name, r.hostCount, r.uptimePct]),
  };
}

export async function fetchData(province: string | null): Promise<MapData> {
  const rows = province
    ? await monitoringGet<Row[]>("/api/districts", { province })
    : await monitoringGet<Row[]>("/api/provinces");
  return { province, rows };
}
