import type { Props as ChartProps } from "react-apexcharts";

type ApexOptions = NonNullable<ChartProps["options"]>;

import { formatNumber, groupThousands } from "../utils/format-number";

/**
 * - bar: single or grouped columns ("Website visits")
 * - stacked: stacked columns ("Area installed")
 * - area: line charts, drawn as smooth lines over a fading fill ("Yearly sales")
 * - mixed: columns with lines; lines keep the widths their chart gives them
 * - pie: tooltip and legend only
 */
export type MinimalsChartKind = "bar" | "stacked" | "area" | "mixed" | "pie";

// Measured on minimals.cc (2026-10-19). Colours that change with the theme are CSS variables,
// set in packages/design_system/src/styles/theme.css, so a chart needs no re-render on a theme switch.
const AXIS = "#919EAB";
const GRID = "rgba(145, 158, 171, 0.2)";

const BASE: ApexOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
    foreColor: AXIS,
    animations: { speed: 360 },
  },
  grid: {
    borderColor: GRID,
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: AXIS, fontSize: "12px", fontWeight: 400 } },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: { style: { colors: AXIS, fontSize: "11px", fontWeight: 400 } },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "13px",
    fontWeight: 500,
    labels: { colors: "var(--chart-legend)", useSeriesColors: false },
    markers: { size: 7, strokeWidth: 0, shape: "circle", offsetX: -2 },
    itemMargin: { horizontal: 8, vertical: 8 },
  },
  states: {
    hover: { filter: { type: "darken" } },
    active: { filter: { type: "darken" } },
  },
  tooltip: { theme: "minimals", x: { show: true }, marker: { show: true } },
};

// Top corners only (both sides), on the top segment of a stack.
const ROUNDED_BARS = { borderRadius: 4, borderRadiusApplication: "end", borderRadiusWhenStacked: "last" } as const;

// Plot width the bar estimate assumes: a half-width card on a laptop. Wider cards only get wider bars.
const TYPICAL_PLOT_WIDTH = 640;

/**
 * Corner radius for columns about `width` px wide: Minimals' 4px on normal columns, less as they thin
 * out, square on hairlines, so a chart with many categories doesn't turn into a row of pills.
 */
export function barRadiusFor(width: number): number {
  if (width >= 16) return 4;
  if (width >= 10) return 2;
  if (width >= 6) return 1;
  return 0;
}

/** Estimated width of one column: the category's share of the plot, times columnWidth, split between grouped bars. */
export function estimatedBarWidth(categories: number, columnWidth: string, barsPerCategory = 1): number {
  if (categories <= 0) return Infinity;
  const share = parseFloat(columnWidth) / 100 || 0.5;
  return ((TYPICAL_PLOT_WIDTH / categories) * share) / Math.max(1, barsPerCategory);
}

const SMOOTH_LINE_MARKERS = { size: 0, strokeColors: "var(--chart-surface)", strokeWidth: 2, hover: { sizeOffset: 6 } };

const KINDS: Record<MinimalsChartKind, ApexOptions> = {
  bar: {
    plotOptions: { bar: { ...ROUNDED_BARS, columnWidth: "48%" } },
    // Transparent 2px stroke: the gap between grouped columns.
    stroke: { show: true, width: 2, colors: ["transparent"] },
    fill: { type: "solid", opacity: 1 },
  },
  stacked: {
    plotOptions: { bar: { ...ROUNDED_BARS, columnWidth: "40%" } },
    stroke: { width: 0 },
    fill: { type: "solid", opacity: 1 },
  },
  area: {
    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },
    fill: { type: "gradient", gradient: { shadeIntensity: 0, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    markers: SMOOTH_LINE_MARKERS,
    tooltip: { shared: true, intersect: false },
    xaxis: { crosshairs: { stroke: { color: AXIS, width: 1, dashArray: 3 } } },
  },
  mixed: {
    plotOptions: { bar: { ...ROUNDED_BARS, columnWidth: "40%" } },
    stroke: { curve: "smooth", lineCap: "round" },
    markers: SMOOTH_LINE_MARKERS,
  },
  pie: {
    legend: { position: "bottom", horizontalAlign: "center" },
    stroke: { colors: ["var(--chart-surface)"] },
  },
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep merge; `over` wins. A yaxis list takes the override on every axis. Functions and arrays are replaced. */
export function mergeChartOptions<T extends Record<string, unknown>>(base: T, over: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const current = out[key];
    if (key === "yaxis" && Array.isArray(current) && isPlainObject(value)) {
      out[key] = current.map((axis) => (isPlainObject(axis) ? mergeChartOptions(axis, value) : axis));
    } else if (isPlainObject(current) && isPlainObject(value)) {
      out[key] = mergeChartOptions(current, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

/**
 * The Minimals look for a chart's options. It wins over the chart's own styling; data, events, colours and labels stay.
 * `barsPerCategory`: columns side by side in one category (grouped bars), so thin columns get smaller corners.
 */
export function withMinimalsChart<T extends Record<string, any>>(options: T, kind: MinimalsChartKind, barsPerCategory = 1): T {
  const base = kind === "pie" ? { chart: BASE.chart, legend: BASE.legend, states: BASE.states, tooltip: BASE.tooltip } : BASE;
  const styled = mergeChartOptions(mergeChartOptions(options, base as Record<string, unknown>), KINDS[kind] as Record<string, unknown>);
  return withGroupedNumbers(withBarRadius(styled, kind === "bar" ? barsPerCategory : 1), kind);
}

/** Shrinks the corner radius of thin columns (many categories or many grouped bars). */
const withBarRadius = (options: Record<string, any>, barsPerCategory: number): any => {
  const bar = options.plotOptions?.bar;
  if (!bar?.columnWidth) return options;
  const categories = (options.xaxis?.categories ?? options.labels ?? []).length;
  const borderRadius = Math.min(bar.borderRadius ?? 4, barRadiusFor(estimatedBarWidth(categories, String(bar.columnWidth), barsPerCategory)));
  return { ...options, plotOptions: { ...options.plotOptions, bar: { ...bar, borderRadius } } };
};

type Formatter = (...args: any[]) => unknown;

const grouped = (value: unknown): unknown =>
  typeof value === "number" ? formatNumber(value) : typeof value === "string" ? groupThousands(value) : Array.isArray(value) ? value.map(grouped) : value;

/** Runs the chart's own formatter (if any), then groups the thousands of what it returns. */
const groupAfter = (formatter: unknown): Formatter =>
  typeof formatter === "function" ? (...args) => grouped((formatter as Formatter)(...args)) : (value: unknown) => grouped(value);

/**
 * Large counts as "138 499" in tooltips, y-axis labels and data labels. A chart's own formatter still
 * decides the text ("95.3%" stays); only runs of 4+ digits get grouped. Pie data labels keep Apex's percentages.
 */
export function withGroupedNumbers<T extends Record<string, any>>(options: T, kind: MinimalsChartKind): T {
  const out: Record<string, any> = { ...options };
  const tooltipY = out.tooltip?.y;
  const groupTooltip = (y: any) => ({ ...y, formatter: groupAfter(y?.formatter) });
  out.tooltip = { ...out.tooltip, y: Array.isArray(tooltipY) ? tooltipY.map(groupTooltip) : groupTooltip(tooltipY) };
  const groupAxis = (axis: any) => (axis ? { ...axis, labels: { ...axis.labels, formatter: groupAfter(axis.labels?.formatter) } } : axis);
  if (kind !== "pie") {
    out.yaxis = Array.isArray(out.yaxis) ? out.yaxis.map(groupAxis) : groupAxis(out.yaxis ?? {});
  }
  if (out.dataLabels?.formatter || kind !== "pie") {
    out.dataLabels = { ...out.dataLabels, formatter: groupAfter(out.dataLabels?.formatter) };
  }
  return out as T;
}
