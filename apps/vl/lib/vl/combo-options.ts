import type { ApexOptions } from "apexcharts";
import type { Series } from "./series";

export type ComboOptionsInput = {
  id: string;
  labels: string[];
  series: Series[];
  stacked?: boolean;
  sparkline?: boolean;
  percentLabels?: boolean;
  yTitles?: [string, string?];
};

const axisOf = (s: Series): 0 | 1 => s.yAxis ?? 0;

export function buildComboOptions(input: ComboOptionsInput): ApexOptions {
  const { id, labels, series, stacked, sparkline, percentLabels, yTitles } = input;
  const formatter = percentLabels ? (v: number) => `${v}%` : (v: number) => String(v);
  const dual = series.some((s) => axisOf(s) === 1);
  const owner = (axis: 0 | 1) => series.find((s) => axisOf(s) === axis)?.name;
  const firstIndex = (axis: 0 | 1) => series.findIndex((s) => axisOf(s) === axis);

  const yaxis: ApexOptions["yaxis"] = dual
    ? series.map((s, i) => {
        const axis = axisOf(s);
        return {
          seriesName: owner(axis),
          opposite: axis === 1,
          show: firstIndex(axis) === i,
          title: { text: yTitles?.[axis] ?? "" },
          labels: { formatter },
        };
      })
    : { title: { text: yTitles?.[0] ?? "" }, labels: { formatter } };

  return {
    chart: {
      id,
      stacked: Boolean(stacked),
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: Boolean(sparkline) },
      fontFamily: "inherit",
    },
    colors: series.map((s) => s.color),
    xaxis: { categories: labels },
    yaxis,
    stroke: { width: series.map((s) => (s.type === "line" ? 3 : 0)), curve: "smooth" },
    markers: { size: sparkline ? 0 : 4 },
    dataLabels: { enabled: Boolean(percentLabels), formatter },
    plotOptions: { bar: { columnWidth: "55%" } },
    legend: { show: !sparkline && series.length > 1, position: "bottom" },
    tooltip: { shared: true, intersect: false },
  };
}

export const toApexSeries = (series: Series[]) =>
  series.map((s) => ({
    name: s.name,
    type: s.type ?? "column",
    data: s.data,
    ...(s.group ? { group: s.group } : {}),
  }));
