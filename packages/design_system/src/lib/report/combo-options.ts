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
  /** Per axis (left, right): range and label format. */
  axes?: [AxisOptions?, AxisOptions?];
  /** A dashed horizontal line, e.g. a programme target. */
  target?: { value: number; label: string; axis?: 0 | 1; color: string };
  /** The card draws its own legend (e.g. with totals). */
  hideLegend?: boolean;
};

/**
 * Series order handed to Apex. In a stacked chart with lines, Apex rounds every column segment
 * unless the lines come first; with them first only the top segment of each stack is rounded.
 */
export const apexOrder = (series: Series[], stacked?: boolean): Series[] =>
  stacked ? [...series.filter((s) => s.type === "line"), ...series.filter((s) => s.type !== "line")] : series;

export type AxisOptions = { min?: number; max?: number; format?: "count" | "percent" };

const AXIS_FORMATTERS = {
  count: (v: number) => Math.round(v).toLocaleString("pt-PT"),
  percent: (v: number) => `${v}%`,
};

const axisOf = (s: Series): 0 | 1 => s.yAxis ?? 0;

export function buildComboOptions(input: ComboOptionsInput): ApexOptions {
  const { id, labels, series, stacked, sparkline, percentLabels, yTitles, axes, target, hideLegend } = input;
  const formatter = percentLabels ? (v: number) => `${v}%` : (v: number) => String(v);
  const dual = series.some((s) => axisOf(s) === 1);
  const owner = (axis: 0 | 1) => series.find((s) => axisOf(s) === axis)?.name;
  const firstIndex = (axis: 0 | 1) => series.findIndex((s) => axisOf(s) === axis);
  const axisFormatter = (axis: 0 | 1) => {
    const format = axes?.[axis]?.format;
    return format ? AXIS_FORMATTERS[format] : formatter;
  };
  const range = (axis: 0 | 1) => {
    const a = axes?.[axis];
    return { ...(a?.min !== undefined && { min: a.min }), ...(a?.max !== undefined && { max: a.max }) };
  };

  const yaxis: ApexOptions["yaxis"] = dual
    ? series.map((s, i) => {
        const axis = axisOf(s);
        return {
          seriesName: owner(axis),
          opposite: axis === 1,
          show: firstIndex(axis) === i,
          title: { text: yTitles?.[axis] ?? "" },
          labels: { formatter: axisFormatter(axis) },
          ...range(axis),
        };
      })
    : { title: { text: yTitles?.[0] ?? "" }, labels: { formatter: axisFormatter(0) }, ...range(0) };

  const targetAxis = target?.axis ?? 0;
  const annotations: ApexOptions["annotations"] = target
    ? {
        yaxis: [
          {
            y: target.value,
            // With dual axes each series has a y-axis entry; the target follows its axis's first series.
            ...(dual && { yAxisIndex: firstIndex(targetAxis) }),
            borderColor: target.color,
            strokeDashArray: 4,
            label: {
              text: target.label,
              borderWidth: 0,
              position: "left",
              textAnchor: "start",
              style: { background: "transparent", color: target.color, fontSize: "11px", fontWeight: 600 },
            },
          },
        ],
      }
    : undefined;

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
    ...(annotations && { annotations }),
    stroke: { width: series.map((s) => (s.type === "line" ? 3 : 0)), curve: "smooth" },
    markers: { size: sparkline ? 0 : 4 },
    dataLabels: { enabled: Boolean(percentLabels), formatter },
    plotOptions: { bar: { columnWidth: "55%" } },
    // One row of items: Apex otherwise clusters the legend by y-axis on dual-axis charts.
    legend: { show: !sparkline && !hideLegend && series.length > 1, position: "bottom", clusterGroupedSeries: false },
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
