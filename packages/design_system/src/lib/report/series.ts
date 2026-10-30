import type { ExcelSheet } from "./export/excel";
import { num } from "./format";

export type Series = {
  name: string;
  data: number[];
  color: string;
  type?: "column" | "line";
  group?: string;
  yAxis?: 0 | 1;
};
export type ChartModel = { labels: string[]; series: Series[] };

export const singleSeries = (name: string, color: string, values: (number | null)[]): Series[] => [
  { name, color, data: values.map((v) => num(v)) },
];

export const chartToSheet = (model: ChartModel, corner = ""): ExcelSheet => ({
  header: [corner, ...model.labels],
  rows: model.series.map((s) => [s.name, ...s.data]),
});
