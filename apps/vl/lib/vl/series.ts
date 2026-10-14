import type { ExcelSheet } from "./export/excel";
import { num } from "./format";
import type { CvCounts, GenderCounts, TatValues } from "./types";

export type Series = {
  name: string;
  data: number[];
  color: string;
  type?: "column" | "line";
  group?: string;
  yAxis?: 0 | 1;
};
export type ChartModel = { labels: string[]; series: Series[] };

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

export const singleSeries = (name: string, color: string, values: (number | null)[]): Series[] => [
  { name, color, data: values.map((v) => num(v)) },
];

export const chartToSheet = (model: ChartModel, corner = ""): ExcelSheet => ({
  header: [corner, ...model.labels],
  rows: model.series.map((s) => [s.name, ...s.data]),
});
