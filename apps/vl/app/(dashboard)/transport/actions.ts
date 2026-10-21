import type { DistributionSegment } from "@repo/design_system/app/atoms/progress/DistributionBar";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { DISTRICT_CODES, PROVINCE_NAMES } from "@/lib/vl/districts";
import { provinceKey, type ProvinceKey } from "@/lib/vl/geo";
import type { ChildLevel, TatUnit } from "@/lib/vl/transport/data";
import { classify, classMeta, offTarget, TAT_CLASSES, TAT_NO_DATA, totalOf, withinTarget, type TatCounts } from "@/lib/vl/transport/tat";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

const unitFor = (units: TatUnit[], name: string) => units.find((u) => norm(u.name) === norm(name));

const colorOf = (unit: TatUnit | undefined) => (unit ? classMeta(classify(unit.counts)).color : TAT_NO_DATA.color);

/** National map: every province coloured by its class, "Sem dados" grey when it has no samples. */
export function provinceColors(units: TatUnit[]) {
  const provinces: Partial<Record<ProvinceKey, { highlighted: boolean; highlightedColor: string; ratio: number }>> = {};
  const fillColors: Partial<Record<ProvinceKey, string>> = {};
  for (const name of PROVINCE_NAMES) {
    const key = provinceKey(name);
    if (!key) continue;
    const color = colorOf(unitFor(units, name));
    provinces[key] = { highlighted: false, highlightedColor: color, ratio: 1 };
    fillColors[key] = color;
  }
  return { provinces, fillColors };
}

/** Province map: every district coloured by its class; the open district outlined. */
export function districtColors(province: string, units: TatUnit[], selected: string | null) {
  const codes = DISTRICT_CODES[province] ?? {};
  const districtRatios: Record<string, number> = {};
  const customColors: Record<string, string> = {};
  for (const [code, district] of Object.entries(codes)) {
    districtRatios[district] = 1;
    customColors[code] = colorOf(unitFor(units, district));
  }
  const highlightedDistricts = selected ? [selected] : [];
  const highlightedColor = selected ? colorOf(unitFor(units, selected)) : TAT_NO_DATA.color;
  return { districtRatios, customColors, highlightedDistricts, highlightedColor };
}

/** The four intervals as bar segments, worst last. */
export const toSegments = (counts: TatCounts): DistributionSegment[] =>
  TAT_CLASSES.map((c, i) => ({ label: c.label, value: counts[i], color: c.color, ink: c.ink }));

export const CHILD_LABEL: Record<ChildLevel, { one: string; many: string; offTarget: string }> = {
  province: { one: "Província", many: "Províncias", offTarget: "Províncias fora do alvo" },
  district: { one: "Distrito", many: "Distritos", offTarget: "Distritos fora do alvo" },
  facility: { one: "Unidade sanitária", many: "Unidades sanitárias", offTarget: "US fora do alvo" },
};

export const offTargetCount = (units: TatUnit[]) => units.filter((u) => offTarget(u.counts)).length;

export const formatShare = (share: number | null) => (share === null ? "—" : `${Math.round(share * 100)}%`);

/** Excel: the area, then one row per child, with the counts per interval. */
export function toExcel(area: TatUnit, children: TatUnit[], level: ChildLevel): ExcelSheet {
  const row = (u: TatUnit) => [
    u.name,
    classMeta(classify(u.counts)).label,
    withinTarget(u.counts) === null ? "" : Math.round((withinTarget(u.counts) as number) * 1000) / 10,
    totalOf(u.counts),
    ...u.counts,
    u.noReceptionDate,
  ];
  return {
    header: [CHILD_LABEL[level].one, "Classe TAT", "% <15 dias", "Amostras", ...TAT_CLASSES.map((c) => c.label), "Sem data de recepção"],
    rows: [...children.map(row), row({ ...area, name: `Total (${area.name})` })],
  };
}
