import { vlGetList } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { pct } from "@/lib/vl/format";
import { provinceKey, type ProvinceKey } from "@/lib/vl/geo";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { ENDPOINT, MAP_COLOR } from "./constants";

export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };

export const fetchData = (range: DateRange, token: string | null) =>
  vlGetList<SuppressionByProvince>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export function toMapProvinces(rows: SuppressionByProvince[]): Partial<Record<ProvinceKey, MapProvince>> {
  const out: Partial<Record<ProvinceKey, MapProvince>> = {};
  for (const row of rows) {
    const key = provinceKey(row.province);
    if (!key) continue;
    out[key] = { highlighted: true, highlightedColor: MAP_COLOR, ratio: pct(row.suppressed, row.total) / 100 };
  }
  return out;
}

export const rowFor = (rows: SuppressionByProvince[], provinceName: string) =>
  rows.find((row) => provinceKey(row.province) !== undefined && provinceKey(row.province) === provinceKey(provinceName));

export function toExcel(rows: SuppressionByProvince[]): ExcelSheet {
  return {
    header: ["Motivo de Teste", ...rows.map((r) => r.province ?? "Sem província")],
    rows: [
      ["Rotina", ...rows.map((r) => r.routine)],
      ["Falência Terapêutica", ...rows.map((r) => r.treatment_failure)],
      ["Motivo não especificado", ...rows.map((r) => r.reason_not_specified)],
      ["Supressão Viral", ...rows.map((r) => r.suppressed)],
      ["Taxa de Supressão (%)", ...rows.map((r) => pct(r.suppressed, r.total))],
      ["Amostras Testadas", ...rows.map((r) => r.total)],
    ],
  };
}
