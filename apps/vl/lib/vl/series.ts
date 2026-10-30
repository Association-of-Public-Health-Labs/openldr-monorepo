import { num } from "@repo/design_system/lib/report/format";
import type { Series } from "@repo/design_system/lib/report/series";
import type { CvCounts, GenderCounts, TatValues } from "./types";

export const TAT_SEGMENTS: { key: keyof TatValues; name: string; color: string }[] = [
  { key: "collection_reception", name: "Colheita à Recepção", color: "#fb8c00" },
  { key: "reception_registration", name: "Recepção ao Registo", color: "#ef5350" },
  { key: "registration_analysis", name: "Registo à Análise", color: "#6B53C6" },
  { key: "analysis_validation", name: "Análise à Validação", color: "#00b000" },
];

export const tatSeries = (rows: TatValues[]): Series[] =>
  TAT_SEGMENTS.map((segment) => ({
    name: segment.name,
    color: segment.color,
    data: rows.map((row) => num(row[segment.key])),
  }));

export const cvSeries = (rows: CvCounts[]): Series[] => [
  { name: "CV > 1000", color: "#fb8c00", data: rows.map((r) => num(r.not_suppressed)) },
  { name: "CV < 1000", color: "#ef5350", data: rows.map((r) => num(r.suppressed)) },
];

export const genderSeries = (rows: GenderCounts[]): Series[] => [
  { name: "Homens (CV < 1000)", group: "Homens", color: "#00b000", data: rows.map((r) => num(r.male_suppressed)) },
  { name: "Homens (CV > 1000)", group: "Homens", color: "rgba(0,176,0,0.4)", data: rows.map((r) => num(r.male_not_suppressed)) },
  { name: "Mulheres (CV < 1000)", group: "Mulheres", color: "#e74c3c", data: rows.map((r) => num(r.female_suppressed)) },
  { name: "Mulheres (CV > 1000)", group: "Mulheres", color: "rgba(231,76,60,0.4)", data: rows.map((r) => num(r.female_not_suppressed)) },
];
